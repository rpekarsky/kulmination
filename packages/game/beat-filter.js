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
