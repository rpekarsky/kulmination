// Beat-stream pre-processor. The analyzer (both the embedded
// detectBeats and the standalone packages/audio-analyzer) emits dense
// clusters of beats firing within milliseconds of each other —
// loadBeats then spawns visibly-overlapping obstacle/coin blocks. We
// thin the stream per beat type: at most one beat of type `b` every
// MIN_GAP_MS. Original loadBeats stays untouched.
//
// Type 1 (coin block) and type 2 (obstacle block) are throttled
// independently — a coin block at t=0 doesn't block an obstacle block
// at t=50.
var MIN_GAP_MS = 100;
function filterBeats(beats, minGapMs){
	var gap = minGapMs == null ? MIN_GAP_MS : minGapMs;
	var lastByType = {};
	var out = [];
	for (var i = 0; i < beats.length; i++) {
		var b = beats[i];
		var last = lastByType[b.b];
		if (last != null && b.a - last < gap) continue;
		lastByType[b.b] = b.a;
		out.push(b);
	}
	return out;
}

// Cap wall (b:2) density to one per WALL_WINDOW_MS. A second wall inside
// the window is demoted to a coin (b:1) instead of being dropped — the
// same beat moment still plays, just as a pickup. Loud techno tracks
// otherwise emit walls every 200-300ms and the run becomes punishing.
// Run BEFORE filterBeats so demoted coins still go through the 100ms
// same-type dedupe.
var WALL_WINDOW_MS = 1000;
function throttleWalls(beats, windowMs){
	var win = windowMs == null ? WALL_WINDOW_MS : windowMs;
	var lastWallAt = -Infinity;
	var out = [];
	for (var i = 0; i < beats.length; i++) {
		var b = beats[i];
		if (b.b === 2) {
			if (b.a - lastWallAt < win) {
				out.push({ a: b.a, b: 1 });
				continue;
			}
			lastWallAt = b.a;
		}
		out.push(b);
	}
	return out;
}
