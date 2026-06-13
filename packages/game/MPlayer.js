var MPlayer = (function(){
	function MPlayer(){
		this.audio = new Audio();
		if (musicSrc) this.audio.src = musicSrc;
	}
	MPlayer.prototype.init = function() {};

	MPlayer.prototype.play = function() {
		if (!this.audio.src) return;        // preview mode — nothing to play
		this.audio.loop = true;
		var self = this;
		var promise = self.audio.play();
		if (promise && promise.catch) {
			promise.catch(function(){
				// Autoplay blocked (Firefox/Chrome since 2017) — wait for first user gesture.
				var resume = function(){
					self.audio.play();
					document.removeEventListener('click', resume);
					document.removeEventListener('touchstart', resume);
					document.removeEventListener('keydown', resume);
				};
				document.addEventListener('click', resume);
				document.addEventListener('touchstart', resume);
				document.addEventListener('keydown', resume);
			});
		}
	};

	MPlayer.prototype.stop = function() {
		this.audio.pause();
	};

	return new MPlayer();
})();
