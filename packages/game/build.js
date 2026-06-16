// Concat-and-minify production bundle. 2014-vintage source files use
// global scope (no ESM/CJS), so we plain-concat in dependency order
// and feed the result through esbuild's JS transform for minification
// only — loader: 'js' (not 'esm') so top-level `var` declarations
// stay attached to the global object after minification.

const fs   = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const SCRIPTS = require('./game-scripts');
const OUT_DIR = path.join(__dirname, 'dist');
const OUT_FILE = path.join(OUT_DIR, 'game.bundle.min.js');

// Globals the post-build name-check expects to find in the minified
// output. With minifyIdentifiers: true, esbuild renames every top-
// level `var X` it sees — but the IIFE in index.html references these
// names directly (they're the contract between the bundled game core
// and the boot-time wiring), so they MUST survive minification. We
// preserve them via the `reserveProps` regex below; this list is the
// post-build sanity check that the regex did its job.
const EXPECTED_GLOBALS = [
	'MPlayer', 'Obstacles', 'scoring', 'reseed', 'Player',
	'scoreHud', 'multiplerHud', 'streakHud', 'bestHud',
	'detectBeats', 'filterBeats', 'throttleWalls',
	'Search', 'SearchUI',
	'Leaderboard', 'LeaderboardUI', 'Ghosts',
	'spline', 'level', 'tubeMesh', 'BgPlate',
	'mainCamera', 'renderer', 'scene',
	'loadBeats', 'addPlates',
];

function readFiles(files){
	return files.map(rel => {
		const abs = path.join(__dirname, rel);
		const src = fs.readFileSync(abs, 'utf8');
		return '/* ===== ' + rel + ' ===== */\n' + src + '\n';
	}).join('\n');
}

async function build(){
	console.log('[build] concatenating ' + SCRIPTS.length + ' files');
	// Strip every `"use strict";` directive — vendor libs (Three.js,
	// dat.gui) ship with it, and once it lands at script top level it
	// flips the WHOLE concatenated bundle into strict mode, which
	// breaks legacy sloppy-mode code (implicit-global assignments like
	// `pivotRotate = …` in tube.js). Before bundling these were
	// separate <script> tags, so each lib's strict directive only
	// applied to itself. We restore that isolation by neutering them.
	const concatenated = readFiles(SCRIPTS)
		.replace(/['"]use strict['"];?/g, '');

	console.log('[build] minifying via esbuild');
	// Identifier minification is ON. In sloppy script mode (which the
	// concat lives in — we strip "use strict" above), esbuild drops the
	// `var` keyword on top-level declarations, turning them into
	// implicit-global assignments. That preserves the cross-file
	// contract (one file declares `Player = …`, another file reads
	// `Player`) without keeping the `var` byte. Top-level names ARE
	// preserved because esbuild's transform mode treats the input as a
	// script and can't prove the externally-visible names go unused.
	// The EXPECTED_GLOBALS post-build check verifies this.
	const result = await esbuild.transform(concatenated, {
		loader: 'js',
		minifyWhitespace:  true,
		minifySyntax:      true,
		minifyIdentifiers: true,
		target:        'es2017',
		legalComments: 'none',
	});

	if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
	fs.writeFileSync(OUT_FILE, result.code);

	const missing = EXPECTED_GLOBALS.filter(name => !result.code.includes(name));
	if (missing.length) {
		console.error('[build] FAIL — expected globals missing from minified output:');
		missing.forEach(n => console.error('  - ' + n));
		console.error('  esbuild may have renamed top-level identifiers. Check loader/minify flags.');
		process.exit(1);
	}

	const kb = (result.code.length / 1024).toFixed(1);
	console.log('[build] OK — ' + OUT_FILE + ' (' + kb + ' KB)');

	if (process.env.KULM_MINIFY_HTML) {
		minifyIndexHtml();
	}
}

// HTML minification — IN-PLACE rewrite of packages/game/index.html.
// Gated by KULM_MINIFY_HTML so a manual local `npm run build` doesn't
// trash the source for editing. build.sh sets the env on CF Pages
// builds; local devs who run `KULM_MINIFY_HTML=1 npm run build` recover
// the source via `git checkout packages/game/index.html`.
function minifyIndexHtml(){
	const htmlPath = path.join(__dirname, 'index.html');
	const before = fs.statSync(htmlPath).size;
	let html = fs.readFileSync(htmlPath, 'utf8');

	// 1. Inline <style>…</style> blocks via esbuild's CSS minifier.
	html = html.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g, (m, open, css, close) => {
		const out = esbuild.transformSync(css, { loader: 'css', minify: true });
		return open + out.code + close;
	});

	// 2. Inline <script>…</script> blocks (the boot IIFE). Match only
	//    attribute-less <script> tags so we skip <script src=…> and the
	//    JSON-LD <script type="application/ld+json"> entirely.
	html = html.replace(/(<script>)([\s\S]+?)(<\/script>)/g, (m, open, js, close) => {
		const out = esbuild.transformSync(js, {
			loader: 'js',
			minifyWhitespace:  true,
			minifySyntax:      true,
			minifyIdentifiers: false,   // IIFE shares names with the bundle
			target:            'es2017',
		});
		return open + out.code + close;
	});

	// 3. Strip HTML comments. No IE conditional comments in this file.
	html = html.replace(/<!--[\s\S]*?-->/g, '');

	// 4. Collapse whitespace BETWEEN tags only (>…<). Whitespace inside
	//    text content / attributes is left alone — that pattern can
	//    only match indentation between sibling elements.
	html = html.replace(/>\s+</g, '><');

	fs.writeFileSync(htmlPath, html);
	const after = html.length;
	console.log('[build] HTML minified — ' + (before/1024).toFixed(1) + ' KB → ' + (after/1024).toFixed(1) + ' KB');
}

build().catch(err => {
	console.error('[build] error:', err);
	process.exit(1);
});
