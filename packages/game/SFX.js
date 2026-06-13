// Sound effects for score events. Volume is controlled separately from the
// music (MPlayer). Each play clones the preloaded <audio> element so rapid
// overlapping calls layer on top of each other instead of restarting the
// previous instance.
var SFX = (function(){
    var DEFAULT_VOL = 0.2;
    var savedVol = parseFloat(localStorage.getItem('sfx-vol'));
    var vol = isNaN(savedVol) ? DEFAULT_VOL : savedVol;
    var sources = {};

    function loadSource(name) {
        var a = new Audio('sounds/' + name + '.wav');
        a.preload = 'auto';
        sources[name] = a;
    }
    loadSource('blip');         // normal Coin pickup
    loadSource('blip2');        // big Coin pickup (Coin.big === true)
    loadSource('pass');         // RotateObstacle successfully avoided (collideOff)
    loadSource('explosion');    // RotateObstacle collision (collideOn)

    return {
        play: function(name) {
            var src = sources[name];
            if (!src) return;
            var a = src.cloneNode();
            a.volume = vol;
            var p = a.play();
            if (p && p.catch) p.catch(function(){});  // silently tolerate autoplay block
        },
        setVolume: function(v) {
            vol = Math.max(0, Math.min(1, v));
            localStorage.setItem('sfx-vol', String(vol));
        },
        getVolume: function() { return vol; }
    };
})();
