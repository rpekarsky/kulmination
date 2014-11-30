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
		this.analyser = AC.createAnalyser();
		// this.scriptProc = AC.createScriptProcessor(1024, 2, 2);
		// this.analyser.connect(AC.destination);
		// this.scriptProc.connect(AC.destination);
		// this.output = this.scriptProc;
		// this.input = this.analyser;
		this.analyser.fftSize = this.fftSize;
		this.analyser.smoothingTimeConstant = 0.5;
		this.processors = [];
		this.loop = this.onAnalyze.bind(this);
		this.init();
		// setInterval(this.onAnalyze.bind(this),0);
	}

	// Analyser.prototype.input = function(source) {
	// 	source.connect(this.analyser);
	// 	// this.analyser.connect(this.scriptProc);
	// };

	Analyser.prototype.init = function() {
		console.log('analiser init');
		this.barsCount = this.analyser.frequencyBinCount;
		this.timeData = new Uint8Array(this.barsCount);
		this.frecData = new Uint8Array(this.barsCount);
		this.onAnalyze();
		// setInterval(this.onAnalyze.bind(this),20);
		// this.scriptProc.onaudioprocess = this.onAnalyze.bind(this);
	};

	Analyser.prototype.destroy = function(analyserProcessor) {
		console.log('Analyser destroy');
		// this.analyser.disconnect(this.scriptProc);
		// this.scriptProc.disconnect(AC.destination);
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
  		// this.analyser.getByteTimeDomainData(this.timeData);
  		this.analyser.getByteFrequencyData(this.frecData);
  		// YAYAYA.textContent = this.frecData[14];
  		// console.log(this.timeData[0]);
  		// setTimeout
  		
  		this.lastTime = Date.now() - this.lastAnalizeTime;
  		this.lastAnalizeTime = Date.now();

  		for (var i = 0; i < this.processors.length; i++) {
  			this.processors[i].ondata(this.timeData,this.frecData);
  		};
  		// if(!this.lastTime){
  		// 	this.lastTime = 0;
  		// }
  		// var timeout = 100-this.lastTime;
  		// if(timeout < 0 ){
  		// 	timeout = 0;
  		// }
  		
  		// setTimeout(this.loop,timeout);
  		// console.log('onAnalyze End');
  		webkitRequestAnimationFrame(this.loop);
	};

	return Analyser;
})()

// var analyser = new Analyser(2048);