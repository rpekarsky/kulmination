// Single source of truth for score / multiplier / streak / highscore.
// Old SCORE global is kept in sync as `window.SCORE` so hud rendering and any
// other legacy reference still works, but writes go through scoring.* methods.
var scoring = (function(){
	var STREAK_TO_NEXT  = 10;
	var BUNDLED_PREFIX  = 'kulm_best_';
	var CUSTOM_PREFIX   = 'kulm_best_custom_';
	var HISTORY_CAP     = 1000;     // safety cap on entries per play

	var state = {
		score:          0,
		multiplier:     1,
		streak:         0,
		currentTrackId: null,
		currentIsCustom:false,
		currentBest:    0,
		history:        [],         // [[t_ms_on_track, score, multiplier], …]
	};

	// `t` is the playhead position (ms) on the audio track, NOT wall-clock
	// — this aligns history entries to the music itself, so two players
	// who scored at the same beat have identical t values regardless of
	// when they ran the track. Falls back to 0 before MPlayer is wired.
	function trackTimeMs(){
		if (typeof MPlayer === 'undefined' || !MPlayer.audio) return 0;
		return Math.round(MPlayer.audio.currentTime * 1000);
	}

	function recordHistory(){
		if (state.history.length >= HISTORY_CAP) return;
		state.history.push([trackTimeMs(), state.score, state.multiplier]);
	}

	function storageKey(){
		if (!state.currentTrackId) return null;
		return (state.currentIsCustom ? CUSTOM_PREFIX : BUNDLED_PREFIX) + state.currentTrackId;
	}

	function refresh(){
		window.SCORE = state.score;
		if (typeof scoreHud !== 'undefined') scoreHud.setScore(state.score);
		if (typeof multiplerHud !== 'undefined') multiplerHud.setMultiplier(state.multiplier);
		if (typeof streakHud !== 'undefined') streakHud.set(state.streak);
		if (typeof bestHud !== 'undefined') bestHud.setBest(state.currentBest);
	}

	function streakStep(){
		state.streak++;
		if (state.streak % STREAK_TO_NEXT === 0) {
			state.multiplier++;
			if (typeof multiplerHud !== 'undefined') multiplerHud.bump();
		}
	}

	return {
		pickup: function(base){
			state.score += base * state.multiplier;
			streakStep();
			recordHistory();
			refresh();
		},
		hit: function(){
			state.multiplier = 1;
			state.streak = 0;
			recordHistory();
			refresh();
		},

		reset: function(trackId, isCustom){
			state.score = 0;
			state.multiplier = 1;
			state.streak = 0;
			state.history = [];
			state.currentTrackId = trackId || null;
			state.currentIsCustom = !!isCustom;
			var key = storageKey();
			state.currentBest = key
				? (parseInt(localStorage.getItem(key) || '0', 10) || 0)
				: 0;
			// Make sure custom tracks have a storage entry from the moment they
			// load so they show up in the list immediately (even before a
			// highscore has been earned).
			if (isCustom && key && localStorage.getItem(key) === null) {
				localStorage.setItem(key, '0');
			}
			refresh();
		},

		// Called when the last obstacle has been passed. Saves highscore for
		// the current track id if we beat it.
		maybeSaveBest: function(){
			var key = storageKey();
			if (!key) return;
			if (state.score > state.currentBest) {
				state.currentBest = state.score;
				localStorage.setItem(key, String(state.score));
				if (typeof bestHud !== 'undefined') bestHud.setBest(state.currentBest);
			}
		},

		// Storage prefixes are public so index.html can scan localStorage for
		// custom entries when rendering the track list.
		BUNDLED_PREFIX: BUNDLED_PREFIX,
		CUSTOM_PREFIX:  CUSTOM_PREFIX,

		getScore:      function(){ return state.score;      },
		getMultiplier: function(){ return state.multiplier; },
		getBest:       function(){ return state.currentBest; },
		getTrackId:    function(){ return state.currentTrackId; },
		getIsCustom:   function(){ return state.currentIsCustom; },
		getHistory:    function(){ return state.history.slice(); },
	};
})();

// Legacy SCORE global — kept readable for any code that still touches it.
window.SCORE = 0;
