var AC = AC || new AudioContext();

var Analyser = (function(){
	function Analyser(fftSize){
		this.fftSize = fftSize || 2048;
		this.context = AC;
		this.scriptProc = AC.createScriptProcessor(256, 1, 1);
		this.analyser = AC.createAnalyser();
		this.analyser.connect(this.scriptProc);
		this.scriptProc.connect(AC.destination);
		this.output = this.scriptProc;
		this.input = this.analyser;
		this.analyser.fftSize = this.fftSize;
		this.analyser.smoothingTimeConstant = 0.3;
		this.processors = [];
		this.init();
	}

	// 440*Math.pow(Math.pow(2,0),1/12)
	Analyser.prototype.init = function() {
		this.barsCount = this.analyser.frequencyBinCount;
		this.scriptProc.onaudioprocess = this.onAnalyze.bind(this);
		this.timeData = new Uint8Array(this.barsCount);
		this.frecData = new Uint8Array(this.barsCount);
		// setInterval(this.onAnalyze.bind(this),10);
	};

	Analyser.prototype.destroy = function(analyserProcessor) {
		this.analyser.disconnect(this.scriptProc);
		this.scriptProc.disconnect(AC.destination);
	};
	Analyser.prototype.register = function(analyserProcessor) {
		this.processors.push(analyserProcessor);
	};
	Analyser.prototype.getAnalyserNode = function() {
		return this.analyser;
	};

	Analyser.prototype.getScriptProc = function() {
		return this.scriptProc;
	};


	Analyser.prototype.onAnalyze = function(e) {
  		this.analyser.getByteTimeDomainData(this.timeData);
  		this.analyser.getByteFrequencyData(this.frecData);
  		for (var i = 0; i < this.processors.length; i++) {
  			this.processors[i].ondata(this.timeData,this.frecData);
  		};
	};

	return Analyser;
})()

var analyser = new Analyser(2048);