// var YAYAYA = document.createElement('em');
// YAYAYA.style.position = 'fixed';
// YAYAYA.style.top = '0px';
// YAYAYA.style.fontSize = '36px';
// YAYAYA.style.color = 'red';
// document.body.appendChild(YAYAYA);

var Analyser = (function(){
	function Analyser(fftSize){
		this.fftSize = fftSize || 2048;
		this.context = AC;
		this.scriptProc = AC.createScriptProcessor(1024, 0, 1);
		this.analyser = AC.createAnalyser();
		this.analyser.connect(this.scriptProc);
		this.scriptProc.connect(AC.destination);
		this.output = this.scriptProc;
		this.input = this.analyser;
		this.analyser.fftSize = this.fftSize;
		this.analyser.smoothingTimeConstant = 0;
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
		// console.log('onAnalyze');
  		this.analyser.getByteTimeDomainData(this.timeData);
  		this.analyser.getByteFrequencyData(this.frecData);
  		// YAYAYA.textContent = this.frecData[14];
  		// console.log(this.timeData[0]);
  		// setTimeout
  		for (var i = 0; i < this.processors.length; i++) {
  			this.processors[i].ondata(this.timeData,this.frecData);
  		};

  		this.lastTime = Date.now() - this.lastAnalizeTime;
  		this.lastAnalizeTime = Date.now();
  		// console.log('onAnalyze End');
	};

	return Analyser;
})()

// var analyser = new Analyser(2048);