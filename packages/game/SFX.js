// Sound effects for score events. Two-level volume:
//   - global `vol`     — user-controlled (sfx slider, saved to localStorage)
//   - per-source scale — author-controlled at loadSource(), to balance
//                        sounds against each other regardless of the global
//                        knob (e.g. whoosh.wav recorded hotter than blip.wav
//                        gets scale 0.6, so when the user sets global to 0.5
//                        the actual playback is 0.5 * 0.6 = 0.3)
//
// Each play clones the preloaded <audio> element so rapid overlapping calls
// layer instead of restarting the previous instance.
var SFX = (function(){
    var DEFAULT_VOL = 0.2;
    var savedVol = parseFloat(localStorage.getItem('sfx-vol'));
    var vol = isNaN(savedVol) ? DEFAULT_VOL : savedVol;
    var sources = {};

    function loadSource(name, scale) {
        var a = new Audio('sounds/' + name + '.wav');
        a.preload = 'auto';
        sources[name] = { audio: a, scale: scale == null ? 1 : scale };
    }
    //          name          scale (0..1, relative loudness)
    loadSource('blip',        0.7);  // normal Coin pickup
    loadSource('blip2',       0.5);  // big Coin pickup
    loadSource('damage',      1.0);  // RotateObstacle collision
    loadSource('whoosh',      0.3);  // RotateObstacle successfully avoided (raw file is hot — 10% to sit under blips)
    // ↑ tweak these once the actual wav files are dropped in and any of
    // them turns out to be louder/quieter than the others.

    function clamp01(v){ return Math.max(0, Math.min(1, v)); }

    return {
        play: function(name) {
            var src = sources[name];
            if (!src) return;
            var a = src.audio.cloneNode();
            a.volume = clamp01(vol * src.scale);
            var p = a.play();
            if (p && p.catch) p.catch(function(){});  // tolerate autoplay block
        },
        setVolume: function(v) {
            vol = clamp01(v);
            localStorage.setItem('sfx-vol', String(vol));
        },
        getVolume: function() { return vol; },
        // Runtime balancer — handy from DevTools if a sound feels off:
        //   SFX.setScale('whoosh', 0.4)
        setScale: function(name, scale) {
            if (sources[name]) sources[name].scale = clamp01(scale);
        },
        getScale: function(name) {
            return sources[name] ? sources[name].scale : null;
        },
    };
})();
