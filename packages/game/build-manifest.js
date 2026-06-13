#!/usr/bin/env node
// Scan tracks/ for <name>.mp3 + matching <name>_beats.js pairs and emit a
// manifest.json the page can fetch to render its preset list. Run via
// `npm run build` (or implicitly via `npm start` through the prestart hook).
//
// Unpaired files (audio without beats, beats without audio, browser-dup
// "(1).js" downloads) are silently skipped — they're junk for our purposes.

const fs = require('fs');
const path = require('path');

const TRACKS_DIR = path.join(__dirname, 'tracks');
const OUT = path.join(TRACKS_DIR, 'manifest.json');

if (!fs.existsSync(TRACKS_DIR)) {
	fs.writeFileSync(OUT, '[]');
	console.log(`No tracks/ directory — wrote empty manifest.`);
	process.exit(0);
}

const all = fs.readdirSync(TRACKS_DIR);
const audioFiles = all.filter(f => /\.(mp3|ogg|wav|m4a|flac)$/i.test(f));

const manifest = audioFiles.flatMap(audio => {
	const base = audio.replace(/\.[^.]+$/, '');
	const beats = base + '_beats.js';
	if (!all.includes(beats)) {
		console.warn(`  skip: ${audio} has no matching ${beats}`);
		return [];
	}
	return [{
		id:    base,
		audio: 'tracks/' + audio,
		beats: 'tracks/' + beats,
	}];
}).sort((a, b) => a.id.localeCompare(b.id));

fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2));
console.log(`Wrote ${manifest.length} track(s) to ${path.relative(__dirname, OUT)}`);
