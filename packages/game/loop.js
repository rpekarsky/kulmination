

var time = 0;
var rotateDelta = 0;
	// curLoopTime = 0.01837088491626749;
	lptm = 10000;

// Firefox advances HTMLAudioElement.currentTime in coarse steps tied to audio
// buffer boundaries (~100ms on Linux), while Chrome updates it nearly per-frame.
// Since the whole timeline is driven by curLoopTime = audio.currentTime/duration,
// reading it directly each frame stair-steps and produces visible jerks on FF.
// We interpolate via performance.now() between samples and resync only on big
// jumps (loop wrap, seek, pause/resume).
var __playStartPerf = null;
var __playStartAudio = 0;
function getSmoothedAudioTime(){
	var actual = MPlayer.audio.currentTime;
	var duration = MPlayer.audio.duration;
	if (MPlayer.audio.paused || !duration || isNaN(duration)) {
		__playStartPerf = null;
		return actual;
	}
	if (__playStartPerf === null || actual < __playStartAudio - 0.5) {
		__playStartPerf = performance.now();
		__playStartAudio = actual;
		return actual;
	}
	var smoothed = __playStartAudio + (performance.now() - __playStartPerf) / 1000;
	if (Math.abs(smoothed - actual) > 0.3) {
		__playStartPerf = performance.now();
		__playStartAudio = actual;
		return actual;
	}
	return smoothed;
}

function mainloop(){
	// lastXto
	time = Date.now();
	// time = 0;
	// var lptm = controller.loopTime;
	// curLoopTime = ((time - lptm) %  lptm)/lptm;
	curLoopTime = getSmoothedAudioTime() / MPlayer.audio.duration;
	// curLoopTime += 0.01837088491626749/1000;
	lastX += (lastXto - lastX)*0.05;
	if(lastXto == width/2){
		lastX += (lastXto - lastX)*0.1;
	}
	// rotateDelta = ((width/2 - lastX)/width);
	rotateDelta = ((width/2 - lastX)/width);
	angle += rotateDelta*controller.rotateSpeed;
	// angle = angle%360;
	// console.log(angle);
	// camera2
	gameCam.update();
	player.update();
	Obstacles.update();
	// colorHSL.h = colorHSLMain.h
	// colorHSL.h += (colorHSLMain.h-colorHSL.h)*0.5;
	// colorHSL.s += (colorHSLMain.s-colorHSL.s)*0.2;
	// colorHSL.l += (colorHSLMain.l-colorHSL.l)*0.1;
	// scene.fog.color.setHSL(colorHSL.h,colorHSL.s,colorHSL.l);
	// BgPlate.prototype.mesh.material.color.setHSL(colorHSL.h,colorHSL.s-.1,colorHSL.l+0.2);
	// BgPlate.prototype.mesh.material.color.setHSL(1,1,1);
	// BgPlate.update();

	
	scoreHud.update();
	hudWrapper.rotation.z = rotateDelta*20*TO_RADIANS;
	hudWrapper.rotation.y = rotateDelta*5*TO_RADIANS;
}