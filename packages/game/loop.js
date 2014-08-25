

var time = 0;
var rotateDelta = 0;
	// curLoopTime = 0.01837088491626749;
	lptm = 10000;
function mainloop(){
	// lastXto
	time = Date.now();
	// time = 0;
	// var lptm = controller.loopTime;
	// curLoopTime = ((time - lptm) %  lptm)/lptm;
	curLoopTime = MPlayer.audio.currentTime/MPlayer.audio.duration;
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