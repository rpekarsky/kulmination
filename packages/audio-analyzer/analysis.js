// создаем аудио контекст
var ctx = document.getElementById('canvas').getContext('2d');
var context = new (window.AudioContext || window.webkitAudioContext)();
// переменные для буфера, источника и получателя
var buffer, source, destination, analyser, scriptProc;
analyser = context.createAnalyser();
analyser.fftSize = 64;
analyser.smoothingTimeConstant = 0.5;
scriptProc = context.createScriptProcessor(512, 1, 1);
scriptProc.onaudioprocess = onAnalisys;
// Gain node — used as the routing point for play() so the vol slider can
// scale loudness in realtime. Default 0.5; updated by the overlay.
var gainNode = context.createGain();
gainNode.gain.value = 0.5;
gainNode.connect(context.destination);


// функция для подгрузки файла в буфер
var loadSoundFile = function(url) {
  // делаем XMLHttpRequest (AJAX) на сервер
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'arraybuffer'; // важно
  xhr.onload = function(e) {
    // декодируем бинарный ответ
    context.decodeAudioData(this.response,
    function(decodedArrayBuffer) {
      // получаем декодированный буфер
      buffer = decodedArrayBuffer;
      console.log('ok!');
      window.dispatchEvent(new Event('audio-ready'));
    }, function(e) {
      console.log('Error decoding file', e);
      window.dispatchEvent(new CustomEvent('audio-error', {detail: e}));
    });
  };
  xhr.onerror = function(e) {
    window.dispatchEvent(new CustomEvent('audio-error', {detail: 'XHR failed for ' + url}));
  };
  xhr.send();
}

 var screenSize = 50;
 var array =  new Uint8Array(analyser.frequencyBinCount);
 var lastArray =  new Uint8Array(analyser.frequencyBinCount);
 var velocity =  new Uint8Array(analyser.frequencyBinCount);
 var velocityArr =  [];
 for (var i = 0; i < analyser.frequencyBinCount; i++) {
 	velocityArr.push(new Array(screenSize));
 };
 ctx.fillStyle='red';

 // Beat-output pipeline (added 2026 revival) — realtime onAnalisys() pushes here.
 // For offline / fast analysis use analyzeOffline() below; it runs its own pipeline
 // on OfflineAudioContext and never touches these globals.
 var detectedBeats = [];
 var playStartTime = 0;
 var BEAT_THRESHOLD = 0.5;
 var BIG_BEAT_THRESHOLD = 1.0;
 
 var X = 0;
 function onAnalisys (event) {
   	analyser.getByteFrequencyData(array);
   	var bins = analyser.frequencyBinCount;
	for (var i = 0; i < bins; i++) {
   		var velocityArr_ = velocityArr[i];
   		velocityArr_.push(array[i]/screenSize);
   		if(velocityArr_.length > screenSize){
   			velocityArr_.shift();
   		}
   		var res = 0;
   		for (var j = 0; j < velocityArr_.length; j++) {
   			res += velocityArr_[j];
   		};
   		velocity[i] =res;
	};

   ctx.clearRect(0, 0, 1000, 100);

   
    for (var i = 0; i < bins; i++) {
   		var height = Math.floor((array[i]/256)*100);
   			ctx.fillStyle='red';
   			ctx.fillRect(
   			i*10+1,	100-height,
   			9,	height);
   	};

   	
   var beat = 0;
   for (var i = 0; i < bins; i++) {
   		var intence = velocity[i];
   		ctx.fillStyle='rgb('+intence+','+intence+','+intence+')';
   		var delta = array[i]-lastArray[i];
   		if(lastArray[i] < array[i]){
	   		if(array[i]>velocity[i]*1.1){
	   			ctx.fillStyle='rgb(255,0,0)';
   				// beat += (delta)*(screenSize-i)/screenSize;
   				beat += (delta/256);
   				// beat += 1
	   		}
   		}
   		var intence = height;
   		ctx.fillRect(
   			X,	i*5+120,
   			1,	5);

   		lastArray[i] = array[i];
   };
	ctx.fillStyle='black';
	// ctx.fillStyle='rgb('+beat+','+beat+','+beat+')';
	ctx.fillRect(
			X+1, 120,
			5,	bins*5);
	ctx.fillStyle='rgb(0,255,100)';
	ctx.fillRect(
			X-2, 120,
			2,	beat*20);


   X++;
   if(X>700){
   	X=0;
   }

   // Push detected beat to the realtime accumulator. Same threshold/type logic
   // as analyzeOffline() below, just running at realtime via ScriptProcessor.
   if (beat > BEAT_THRESHOLD) {
       var t = (event && event.playbackTime != null) ? event.playbackTime - playStartTime : 0;
       detectedBeats.push({
           a: Math.round(t * 1000 * 1000) / 1000,
           b: beat > BIG_BEAT_THRESHOLD ? 2 : 1
       });
   }
}

// функция начала воспроизведения
var play = function(){
  detectedBeats = [];                       // fresh per playback
  playStartTime = context.currentTime;      // make onAnalisys timestamps buffer-relative
  // создаем источник
  source = context.createBufferSource();
  // подключаем буфер к источнику
  source.buffer = buffer;
  // route through gainNode (which goes to context.destination) so vol slider works
  destination = gainNode;
  source.connect(analyser);
  analyser.connect(destination);
  scriptProc.connect(destination);
  source.connect(destination);
  // воспроизводим
  source.start(0);
}

// функция остановки воспроизведения
var stop = function(){
  source.stop(0);
}

// Offline (fast) analysis. Renders the whole buffer through an isolated
// AnalyserNode + ScriptProcessor on an OfflineAudioContext — the browser runs
// the graph as fast as the CPU allows (typically 10–50× realtime). Same beat-
// detection heuristic as onAnalisys(), kept self-contained so we don't have to
// refactor the realtime path.
var analyzeOffline = function(onProgress, onDone){
    if (!buffer) { onDone({error: 'no audio buffer loaded yet'}); return; }
    var offCtx = new OfflineAudioContext(
        buffer.numberOfChannels || 1,
        buffer.length,
        buffer.sampleRate
    );
    var offSrc = offCtx.createBufferSource();
    offSrc.buffer = buffer;
    var offAna = offCtx.createAnalyser();
    offAna.fftSize = 64;
    offAna.smoothingTimeConstant = 0.5;
    var offProc = offCtx.createScriptProcessor(512, 1, 1);

    var bins = offAna.frequencyBinCount;
    var arr = new Uint8Array(bins);
    var lastArr = new Uint8Array(bins);
    var velArr = [];
    for (var i = 0; i < bins; i++) velArr.push([]);
    var velSize = 50;
    var beats = [];

    offProc.onaudioprocess = function(e){
        offAna.getByteFrequencyData(arr);
        for (var i = 0; i < bins; i++) {
            var va = velArr[i];
            va.push(arr[i] / velSize);
            if (va.length > velSize) va.shift();
        }
        var velocityCached = new Array(bins);
        for (var i = 0; i < bins; i++) {
            var sum = 0;
            for (var j = 0; j < velArr[i].length; j++) sum += velArr[i][j];
            velocityCached[i] = sum;
        }
        var beat = 0;
        for (var i = 0; i < bins; i++) {
            if (lastArr[i] < arr[i] && arr[i] > velocityCached[i] * 1.1) {
                beat += (arr[i] - lastArr[i]) / 256;
            }
            lastArr[i] = arr[i];
        }
        if (beat > BEAT_THRESHOLD) {
            beats.push({
                a: Math.round(e.playbackTime * 1000 * 1000) / 1000,
                b: beat > BIG_BEAT_THRESHOLD ? 2 : 1
            });
        }
        if (onProgress) onProgress(e.playbackTime / buffer.duration);
    };

    offSrc.connect(offAna);
    offAna.connect(offProc);
    offProc.connect(offCtx.destination);
    offSrc.connect(offCtx.destination);

    offSrc.start(0);
    offCtx.startRendering().then(function(){
        onDone({beats: beats, duration: buffer.duration * 1000});
    }).catch(function(err){
        onDone({error: err && err.message || String(err)});
    });
};

loadSoundFile(window.TRACK_URL);