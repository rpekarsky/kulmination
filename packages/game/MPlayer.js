var MPlayer = (function(){
	function MPlayer(){
		this.callback;
		this.audio = new Audio();
		this.audioDelayed = new Audio();
		this.source = AC.createMediaElementSource(this.audio);
		this.sourceDelayed = AC.createMediaElementSource(this.audioDelayed);
		this.sourceDelayed.connect(AC.destination);
		// this.delayNode = AC.createDelay();
	}
	MPlayer.prototype.init = function(src,callback) {
		console.log("init...");
		this.callback = callback;
		this.audio.onloadeddata = function(){
			if(this.callback){
				this.callback();
			}
			console.log("loaded!",this);
		}.bind(this);
		this.audio.src = src;
		this.audioDelayed.src = src;
	  	// this.source.connect(AC.destination);
		// this.delayNode.delayTime.value = 5;
		// this.delayNode.connect(AC.destination);
	};
	
	MPlayer.prototype.play = function() {
	    this.audio.loop = true;
	    this.audio.play();
	    // this.audioDelayed.play();  
	};

	MPlayer.prototype.stop = function() {
	    this.audio.pause();
	    this.audioDelayed.pause();
	};

	return new MPlayer();
})();
