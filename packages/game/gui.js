var gui = new dat.GUI();
var controller = {
	rotateSpeed:30,
	BUTTON:function() {
		mainCamera = (mainCamera === camera)? gameCam.camera: camera;
	},
	loopTime: 162000
};
// gui.add(controller,'A',0,Math.PI*2);
// gui.add(controller,'B',0,Math.PI*2);
gui.add(controller,'BUTTON');
gui.add(controller,'loopTime',1,162000);
gui.add(controller,'rotateSpeed',1,300);
gui.close();
gui.domElement.style.display = 'none';