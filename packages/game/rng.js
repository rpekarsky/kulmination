// Replace Math.random with a seedable PRNG so a given track's obstacle
// layout, tube z-jitter and bg plate distribution are stable across
// reloads. mulberry32 — small, fast, decent distribution; way more than
// enough for "give me the same level twice".
//
// Reseeded inside swap() right before tube.js + loadBeats + addPlates
// run, so each track replay starts from a known state.
var SEED = 42;
(function(){
	var state = SEED >>> 0;
	function next(){
		var t = state += 0x6D2B79F5;
		t = Math.imul(t ^ t >>> 15, t | 1);
		t ^= t + Math.imul(t ^ t >>> 7, t | 61);
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	}
	Math.random = next;
	window.reseed = function(seed){
		state = (seed >>> 0) || SEED;
	};
})();
