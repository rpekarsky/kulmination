// создаем аудио контекст
var ctx = document.getElementById('canvas').getContext('2d');
var context = new window.webkitAudioContext(); //
// переменные для буфера, источника и получателя
var buffer, source, destination, analyser, scriptProc;
analyser = context.createAnalyser();
analyser.fftSize = 64;
analyser.smoothingTimeConstant = 0.5;
scriptProc = context.createScriptProcessor(512, 1, 1);
scriptProc.onaudioprocess = onAnalisys;


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
    }, function(e) {
      console.log('Error decoding file', e);
    });
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

}

// функция начала воспроизведения
var play = function(){
  // создаем источник
  source = context.createBufferSource();
  // подключаем буфер к источнику
  source.buffer = buffer;
  // дефолтный получатель звука
  destination = context.destination;
  // подключаем источник к получателю
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

loadSoundFile('example2.mp3');