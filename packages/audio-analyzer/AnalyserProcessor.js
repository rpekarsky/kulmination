// var speed = 0.05;
var AnalyserProcessor = (function(){

	function moveHistory(arr){
	  var first = arr[0];
	  for (var i = 0; i < arr.length; i++) {
	    arr[i] = arr[i+1]||0;
	  };
	  return first;
	}

	function AnalyserProcessor(options){
		this.options = options;
		this.analyser = options.analyser;
		this.drawer = options.drawer;
		this.init();
	}
	AnalyserProcessor.prototype.init = function() {

		this.analyser.register(this);

		
		this.selectedFrec = this.options.maxfreq - this.options.minfreq;
		// console.log(selectedFrec);
		// this.barsCount = this.options.maxfreq - this.options.minfreq;
		this.barsCount = this.analyser.analyser.frequencyBinCount;
		// console.log(this.barsCount);
		// this.workingData = new Uint8Array(this.barsCount);

		this.AvrVHystoryScreen = 50;
		this.AvrVHystory = new Uint8Array(this.AvrVHystoryScreen);
		this.AvrVHystoryRes = 0;
		this.AvrHystorySplashScreen = 6; //10
		this.AvrHystorySplash = new Uint8Array(this.AvrHystorySplashScreen);
		this.AvrHystorySplashRes = 0;

		this.BeatEnergyScreen = 50;
		this.BeatEnergy = new Uint8Array(this.BeatEnergyScreen);
		this.BeatEnergyRes = 0;

		this.BigBeatEnergyScreen = 10;
		this.BigBeatEnergy = new Uint8Array(this.BigBeatEnergyScreen);
		this.BigBeatEnergyRes = 0;

		this.SmoothingScreen =5;//5
		this.Smoothing = new Uint8Array(this.SmoothingScreen);
		this.SmoothingRes = 0;

		this.historyScreen = 20;
		this.historyBars = new Array(this.barsCount);
		this.historyAvg = new Array(this.barsCount);

		this.isBeat = false;
		this.isBeat1 = false;
		this.isBeat2 = false;
		this.prevIsBeat = false;
		this.callback = undefined;
		this.velocityTreshold = 100;
		this.workingData = 0;
	};
	AnalyserProcessor.prototype.ondata = function(dataDomain,dataFrec,e) {
		this.timeData = dataDomain;
		this.freqData = dataFrec;
		this.drawer.draw(this);
		return ;
		// console.log('working...',e.playbackTime);
		// console.log(dataFrec)
		// this.timeData = dataFrec;
		this.isBeat = false;
		this.isBeat1 = false;
		this.isBeat2 = false;

		this.PrevAvrVHystoryRes = this.AvrVHystoryRes;
		this.PrevAvrHystorySplashRes = this.AvrHystorySplashRes;
		// this.analyser.getByteTimeDomainData(this.timeData);

		this.workingData = 0;
		var timeDomainAvg = 0;

		this.PrevAvrVHystoryRes = 0;
		this.PrevAvrHystorySplashRes = 0;
		

		for (var i = 0; i < this.selectedFrec; i++) {
			// this.workingData += this.timeData[this.options.minfreq+i];
			this.workingData += this.freqData[i];
			// this.workingData += Math.abs(this.timeData[i]-128);
			// this.workingData += Math.abs(this.freqData[this.options.minfreq+i]);
		};
		// this.workingData = Math.abs(this.workingData-this.selectedFrec*128)/this.selectedFrec;
		this.workingData /= this.selectedFrec;
		
		// this.workingData = 128/2;
  		// console.log(this.workingData,this.selectedFrec);

		this.AvrVHystoryRes = 0;
		var lastAvrVHystory = moveHistory(this.AvrVHystory);
		this.AvrVHystory[this.AvrVHystoryScreen-1] = this.workingData;
		for (var i = 0; i < this.AvrVHystoryScreen; i++) {
			this.AvrVHystoryRes += this.AvrVHystory[i]/this.AvrVHystoryScreen;
		};


		this.AvrHystorySplashRes = 0;
		var lastAvrHystorySplash = moveHistory(this.AvrHystorySplash);
		this.AvrHystorySplash[this.AvrHystorySplashScreen-1] = this.workingData;
		for (var i = 0; i < this.AvrHystorySplashScreen; i++) {
			this.AvrHystorySplashRes += this.AvrHystorySplash[i]/this.AvrHystorySplashScreen;
		};

		this.SmoothingRes = 0;
		var lastSmoothing = moveHistory(this.Smoothing);
		this.Smoothing[this.SmoothingScreen-1] = this.workingData;
		for (var i = 0; i < this.SmoothingScreen; i++) {
			this.SmoothingRes += this.Smoothing[i]/this.SmoothingScreen;
		};

		
		this.velocityTreshold += (this.AvrHystorySplashRes*0.8-(this.velocityTreshold)+0.1)*0.1;
		var velocity = (this.SmoothingRes-this.AvrVHystoryRes)-(this.AvrHystorySplashRes-this.AvrVHystoryRes);
		// console.log(this.velocityTreshold,velocity,prev)
		var scale = this.velocityTreshold*1.1;
		this.velocityScaled = velocity*scale/this.BeatEnergyRes;

		if((this.AvrHystorySplashRes-this.AvrVHystoryRes)>0){

			this.BeatEnergyRes = 0.8;
			var last = moveHistory(this.BeatEnergy);
			this.BeatEnergy[this.BeatEnergyScreen-1] = Math.abs(velocity);
			for (var i = 0; i < this.BeatEnergyScreen; i++) {
				this.BeatEnergyRes += this.BeatEnergy[i]/this.BeatEnergyScreen;
			};

			this.BigBeatEnergyRes = 0.8;
			var last = moveHistory(this.BigBeatEnergy);
			this.BigBeatEnergy[this.BigBeatEnergyScreen-1] = Math.abs(velocity);
			for (var i = 0; i < this.BigBeatEnergyScreen; i++) {
				this.BigBeatEnergyRes += this.BigBeatEnergy[i]/this.BeatEnergyScreen;
			};

		// if(velocity > 0){
			if(this.velocityScaled>this.velocityTreshold){
				this.isBeat = true;
			}
		// }
		} else {
			this.velocityScaled = 0;
		}
		
		this.bigVelocityScaled = velocity*(scale/(this.BeatEnergyRes*1.5))/this.BigBeatEnergyRes;
		if(this.isBeat && !this.prevIsBeat){
			// this.isBeat = true;
			if(this.bigVelocityScaled>this.velocityTreshold){
				// bigBeatIntense = 255;
				this.isBeat2 = true;
				if(this.callback) this.callback(MPlayer.getAnalise()*MPlayer.analiseSpeed,2);
				// new Beat(Math.floor(MPlayer.audio.currentTime*1000),2);
			} else {
				if(this.callback) this.callback(MPlayer.getAnalise()*MPlayer.analiseSpeed,1);
				// new Beat(Math.floor(MPlayer.audio.currentTime*1000),1)
				this.isBeat1 = true;
			}
		}
		
		this.prevIsBeat = this.isBeat;
		// this.drawer.draw(this);


	};
	return AnalyserProcessor;
})();
