var MPlayer = (function(){
	function MPlayer(){
		this.audio = new Audio();
	}
	MPlayer.prototype.init = function(src) {
		this.audio.src = src;
	};
	
	MPlayer.prototype.play = function() {
	    this.audio.loop = true;
	    this.audio.play();
	};

	MPlayer.prototype.stop = function() {
	    this.audio.pause();
	};

	return new MPlayer();
})();
