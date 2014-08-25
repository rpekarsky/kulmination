var GameCamera = (function () {
	function GameCamera () {
		this.height = 15;
		this.fovNormal = 85;
		this.fov = this.fovNormal;
		this.fovSpeed = 0.1;
		this.fovTo = 0.1;
		this.camera = new THREE.PerspectiveCamera( this.fov, width / height, 0.1, 10000 );
		this.angle = 0;
		this.shake = new THREE.Vector3();
		this.shakeValue = 0.3;

		this.init();
	}
	GameCamera.prototype.init = function() {
		scene.add(this.camera);
	};
	GameCamera.prototype.update = function() {
		this.angle += (angle - this.angle)*0.2;
		var offset = 50/level.length

		this.fovTo += (this.fovNormal - this.fovTo)*this.fovSpeed;
		this.fov += (this.fovTo - this.fov)*0.4;

		var fovdelta = (this.fovNormal - this.fov)/this.fovNormal;
		// var offset = 2
		var v4 = spline.getPointAt(Math.abs(curLoopTime-offset-offset*fovdelta));
		var v4d = spline.getTangentAt(Math.abs(curLoopTime-offset));


		// var v4 = spline.getPointAt(curLoopTime);
		// var v4d = spline.getTangentAt(curLoopTime);
		this.shake.x = Math.random()*2-1;
		this.shake.y = Math.random()*2-1;
		this.shake.z = Math.random()*2-1;

		var v4n = spline.getPointAt((curLoopTime+offset*7)%1);
		var v4nd = spline.getTangentAt((curLoopTime+offset*7)%1);
		this.calculatedPosition = new THREE.Vector3(v4.x,v4.y,v4.z);
		this.calculatedDirection = new THREE.Vector3(v4d.x,v4d.y,v4d.z);

		var cross = this.calculatedDirection.clone().cross(vectorUp);
		this.camera.position = this.calculatedPosition.clone().add(cross.applyAxisAngle(this.calculatedDirection,this.angle*TO_RADIANS).multiplyScalar(tubeRadius-this.height));
		this.camera.position.add(this.shake.multiplyScalar(this.shakeValue));
		this.camera.up = cross.clone().negate();
		
		// this.shakeValue = this.shakeValue;
		this.shakeValue += (0.1 -this.shakeValue)*0.06;

		// this.camera.up = this.calculatedPosition.clone()
		// this.camera.position
		// this.light.position = this.calculatedPosition;

		
		// this.light.target;
		// this.lightTarget.position = spline.getPointAt((curLoopTime+0.2)%1);
		this.camera.lookAt(v4n);
		this.camera.fov = this.fov;
		this.camera.updateProjectionMatrix();
		// this.camera.rotateOnAxis(this.calculatedDirection,90*TO_RADIANS);
	};
	return GameCamera;
})();
