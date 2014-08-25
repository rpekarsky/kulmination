var Player = (function(){
	var bodyMaterial = new THREE.MeshBasicMaterial( { color: 0x9090f0, wireframe:false, transparent: false, opacity: 0.7 } ); 
	function Player(){
		this.pivotObject = new THREE.Object3D();
		this.pivotRotate = new THREE.Object3D();
		this.pivotPosition = new THREE.Object3D();
		this.rotation = 0;
		this.height = 5.5;

		this.body = new THREE.BoxGeometry(1,1,1);
		this.body = new THREE.Mesh(this.body,bodyMaterial);

		this.calculatedPosition = new THREE.Vector3;
		this.calculatedDirection = new THREE.Vector3;


		this.init();
	}

	Player.prototype.init = function() {
		this.pivotObject.add(this.body);
		this.body.scale.set(3.8,3.8,0.6);

		this.pivotRotate.add(this.pivotObject);
		this.pivotPosition.add(this.pivotRotate);
		
		scene.add(this.pivotPosition);

	};

	var ttt = 0.1001;
	Player.prototype.update = function() {
		this.rotation = angle;
		var offset = 30/level.length
		// this.position = new THREE.Vector3().applyMatrix4(this.body.matrixWorld);;
		
		var v4 = spline.getPointAt((curLoopTime)%1);
		var v4d = spline.getTangentAt((curLoopTime)%1);
		// var v4n = spline.getPointAt((curLoopTime+offset)%1);
		// var v4nd = spline.getTangentAt((curLoopTime+offset)%1);


		this.calculatedPosition = new THREE.Vector3(v4.x,v4.y,v4.z);
		this.calculatedDirection = new THREE.Vector3(v4d.x,v4d.y,v4d.z);

		var cross = this.calculatedDirection.clone().cross(vectorUp);
		// this.pivotRotate.rotateOnAxis(cross,90*TO_RADIANS);
		
		// this.pivotPosition.position = this.calculatedPosition.clone().add(cross.applyAxisAngle(this.calculatedDirection,angle*TO_RADIANS).multiplyScalar(tubeRadius-this.height));
		this.pivotPosition.position = this.calculatedPosition;
		this.pivotObject.position.z = tubeRadius-this.height;
		// this.pivotRotate.rotation.x = this.rotation*TO_RADIANS;
		// this.pivotRotate.rotation.y = 90*TO_RADIANS;

		// this.pivotPosition.up = cross.clone().negate();
		// this.pivotPosition.lookAt(this.pivotPosition.add(this.calculatedDirection));

		// this.pivotRotate.rotation.z = Math.sin(time/100)*30*TO_RADIANS;
		// this.pivotRotate.rotation.y = angle*TO_RADIANS;

		// this.pivotRotate.rotation.z = -rotateDelta*90*1.5*TO_RADIANS;
		// this.pivotRotate.rotation.y = rotateDelta*10*TO_RADIANS;

		// this.frontWheel.pivotObject.rotation.x = rotateDelta*45*TO_RADIANS;
		// this.frontWheel.pivotObject.rotation.y = -rotateDelta*30*TO_RADIANS;
		// this.frontWheel.update();
		// this.backWheel.update();

	}
	return Player;
})()