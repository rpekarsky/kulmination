// Pure beat-detection function — same algorithm as
// packages/audio-analyzer/analysis.js (offline path). Duplicated here on
// purpose: keeps both packages standalone vanilla HTML, no shared module,
// no bundler. If the algorithm ever changes, update both files.
//
// detectBeats(audioBuffer, onProgress)
//   audioBuffer: an AudioBuffer (from AudioContext.decodeAudioData)
//   onProgress:  optional (fraction 0..1) called as the offline render advances
//   returns:     Promise<{beats: [{a,b}], duration: number}>  ms
//                where  b === 2 → "big beat" (mapped to RotateObstacle by loadBeats)
//                       b === 1 → "regular beat" (mapped to Coin block)
//
// Internals: runs the buffer through an OfflineAudioContext with a 64-bin
// AnalyserNode + ScriptProcessor and re-applies the same threshold/velocity-
// average heuristic the live analyzer uses. Typically 10–50× realtime.
var detectBeats = function(audioBuffer, onProgress) {
	var BEAT_THRESHOLD     = 0.5;
	var BIG_BEAT_THRESHOLD = 1.0;

	return new Promise(function(resolve, reject){
		if (!audioBuffer) { reject(new Error('no audio buffer')); return; }

		var offCtx = new OfflineAudioContext(
			audioBuffer.numberOfChannels || 1,
			audioBuffer.length,
			audioBuffer.sampleRate
		);
		var src = offCtx.createBufferSource();
		src.buffer = audioBuffer;
		var ana = offCtx.createAnalyser();
		ana.fftSize = 64;
		ana.smoothingTimeConstant = 0.5;
		var proc = offCtx.createScriptProcessor(512, 1, 1);

		var bins = ana.frequencyBinCount;
		var arr = new Uint8Array(bins);
		var lastArr = new Uint8Array(bins);
		var velArr = [];
		for (var i = 0; i < bins; i++) velArr.push([]);
		var velSize = 50;
		var beats = [];

		proc.onaudioprocess = function(e){
			// Firefox keeps firing onaudioprocess past the buffer end in an
			// OfflineAudioContext (e.playbackTime climbs to ~1.4× duration).
			// Those late callbacks process silence and would emit beats with
			// timestamps past audioBuffer.duration — loadBeats then places
			// obstacles at pos > level.length and spline.getPointAt blows up.
			if (e.playbackTime > audioBuffer.duration) return;

			ana.getByteFrequencyData(arr);
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
			if (onProgress) onProgress(e.playbackTime / audioBuffer.duration);
		};

		src.connect(ana);
		ana.connect(proc);
		proc.connect(offCtx.destination);
		src.connect(offCtx.destination);

		src.start(0);
		offCtx.startRendering().then(function(){
			resolve({ beats: beats, duration: audioBuffer.duration * 1000 });
		}).catch(reject);
	});
};
