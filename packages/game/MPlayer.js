var MPlayer = (function(){
	function MPlayer(){
		this.callback;
		this.buffer = null;
		this.duration = 0;
		this.delay = 0;
		this.analiseSpeed = 1;
		// this.source.connect(AC.destination);
	}


	MPlayer.prototype.loadSoundFile = function(url) {
	  var xhr = new XMLHttpRequest();
	  this.xhr = xhr;
	  xhr.open('GET', url, true);
	  xhr.responseType = 'arraybuffer'; // важно
	  xhr.onload = function(e) {
	    var startDecode = Date.now();
	    AC.decodeAudioData(this.xhr.response,
	    function(decodedArrayBuffer) {
	      this.buffer = decodedArrayBuffer;
	      this.duration = this.buffer.duration;
	      this.play();
	    }.bind(this), function(e) {

	    });
	  }.bind(this);;
	  xhr.send();
	}


	MPlayer.prototype.init = function(src,delay,callback) {
		console.log("init...");
		this.callback = callback;
		this.delay = delay;

		this.source = AC.createBufferSource();
		this.sourceDelayed = AC.createBufferSource();
		// this.biquad = AC.createBiquadFilter();
		// this.ossc = AC.createOscillator();
		// this.osscGain = AC.createGain();

		// this.ossc.connect(this.osscGain);
		// this.ossc.frequency.value = 440*4;
		// this.osscGain.connect(AC.destination);
		// this.osscGain.gain.value = 0;
		// this.sourceDelayed.connect(this.biquad);
		this.sourceDelayed.connect(AC.destination);
		// this.biquad.frequency.value = this.biquad.frequency.maxValue;
		// this.biquad.Q.value = 1;

		// this.biquad.connect(AC.destination);

		this.loadSoundFile(src);
		// this.ossc.start(0);
	};

	MPlayer.prototype.getAnalise = function() {
		return Date.now()-this.startTime; //AC.currentTime is laggy
	};

	MPlayer.prototype.getTime = function() {

		// if(!this.lastGetTime){
		// 	this.lastGetTime = Date.now();
		// }

		// var timeDelta = Date.now()-this.lastGetTime;

		// this.playbackTime += timeDelta*this.sourceDelayed.playbackRate.value;

		// this.lastGetTime = Date.now();

		// return Math.max(this.playbackTime-this.delay*1000,0);
		return Math.max(Date.now()-this.startTimeDelayed,0);
	};
	
	MPlayer.prototype.jamm = function(){
		// this.sourceDelayed.playbackRate.value = 0.3;
		// TweenLite.to(this.sourceDelayed.playbackRate, 1, {value:1,delay:1,ease:Power2.easeOut})

		// MPlayer.biquad.frequency.value = 440
		// this.biquad.frequency.value = 690;
		// this.osscGain.gain.value = 0.2;
		// TweenLite.to(this.biquad.frequency, 3, {value:this.biquad.frequency.maxValue,delay:0.5,ease:Power2.easeOut});
		// TweenLite.to(this.osscGain.gain, 3, {value:0,delay:0,ease:Power2.easeOut});

		// TweenLite.to(this.biquad.frequency, 0.5, {value:620,delay:0,ease:Power2.easeOut,
		// 	onComplete:TweenLite.to.bind(this,this.biquad.frequency, 2, {value:this.biquad.frequency.maxValue,delay:0.5,ease:Power2.easeOut})
		// })
		// TweenLite.to(this.osscGain.gain, 1, {value:0.1,delay:0,ease:Power2.easeOut,
		// 	onComplete:TweenLite.to.bind(this,this.osscGain.gain, 1, {value:0,delay:0,ease:Power2.easeOut})
		// })
		// this.osscGain.gain.value = 0;
		// TweenLite.to(this.sourceDelayed.playbackRate, 0.2, {value:0.85,delay:0,
		// 	onComplete:TweenLite.to.bind(this,this.sourceDelayed.playbackRate, 1, {value:1,delay:0.5})
		// })
	}
	
	MPlayer.prototype.play = function() {
		var globalDelayDOM = document.getElementById('globalDelayDOM');
		this.startTime = Date.now();//AC.currentTime;
		this.startTimeDelayed = this.startTime-this.delay*1000;
		this.playbackTime = 0;
		this.source.buffer = this.buffer;
		this.source.connect(AC.destination);
		// this.sourceDelayed.buffer = this.buffer;
		// this.sourceDelayed.playbackRate.value = this.source.playbackRate.value = 1.3;
		// this.source.playbackRate.value = this.analiseSpeed;

	    this.source.start(AC.currentTime);
	    // this.sourceDelayed.start(AC.currentTime+parseFloat(globalDelayDOM.value));
		this.callback();
	};

	MPlayer.prototype.stop = function() {
	    this.sourceDelayed.disconnect(AC.destination);
	    this.xhr.abort();
	    try{
		    this.source.stop(0);
		    // this.sourceDelayed.stop(0);
	    } catch(e){
	    	
	    }
	    this.buffer = null;
	};

	return new MPlayer();
})();
