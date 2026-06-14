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
// output. If esbuild ever drifts and renames any top-level identifier,
// the build fails loudly instead of shipping a broken bundle.
// Globals defined inside the bundled files. game-scripts.js (which
// defines GAME_SCRIPTS) is loaded separately via <script src> in
// index.html, so its global is NOT expected to appear in this bundle.
const EXPECTED_GLOBALS = [
	'MPlayer', 'Obstacles', 'scoring', 'reseed', 'Player',
	'scoreHud', 'multiplerHud', 'streakHud', 'bestHud',
	'detectBeats', 'filterBeats',
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
	// minifyIdentifiers: false — legacy code uses top-level `var Foo = …`
	// as cross-file globals. Renaming would break the implicit contract
	// where one file declares it and another reads it via window scope.
	// Keep whitespace + syntax minification (still cuts ~60%).
	const result = await esbuild.transform(concatenated, {
		loader: 'js',
		minifyWhitespace:  true,
		minifySyntax:      true,
		minifyIdentifiers: false,
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
}

build().catch(err => {
	console.error('[build] error:', err);
	process.exit(1);
});
