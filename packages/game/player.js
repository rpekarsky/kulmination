var Player = (function(){
	var FlyCoin = (function(){
		var FlyCoinMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff90, transparent:true, opacity:0.4 } ); 
		function FlyCoin(){
			this.obj = new THREE.Object3D();
			this.pivotObject = new THREE.Object3D();
			this.pivotObject.position.z = 7;
			this.pivotRotation = new THREE.Object3D();
			this.pivotPosition = new THREE.Object3D();

			this.mesh = new THREE.Mesh(new THREE.OctahedronGeometry(2,0),FlyCoinMaterial);
			this.obj.add(this.mesh);
			this.pivotObject.add(this.obj);
			this.pivotRotation.add(this.pivotObject);
			this.pivotPosition.add(this.pivotRotation);
		};

		FlyCoin.prototype.update = function() {
			this.pivotRotation.rotation.x += 15*TO_RADIANS;
			this.pivotRotation.rotation.y += 11*TO_RADIANS;
		};
		
		return FlyCoin;
	})();

	// var color = 0x9090f0;
	var color = 0x101010;
	var bodyMaterial = new THREE.MeshBasicMaterial( { color: color, wireframe:false, transparent: false, opacity: 0.7 } ); 
	var parent = GameObject.prototype;
	function Player(){
		parent.constructor.call(this,{height:5,delta:0,debug:true});

		this.geom = new THREE.BoxGeometry(1,1,1);
		this.mesh = new THREE.Mesh(this.geom,bodyMaterial);
		this.init();
	}
	Player.prototype = Object.create(parent)
	Player.prototype.flycoins = [];
	Player.prototype.init = function() {
		parent.init.call(this);

		this.obj.add(this.mesh);
		this.mesh.rotation.z = 45*TO_RADIANS;
		this.mesh.rotation.y = 90*TO_RADIANS;
		
		this.obj.scale.set(1,4,8);

		scene.add(this.pivotPosition);
	};

	Player.prototype.addCoin = function() {
		var fc = new FlyCoin;
		Player.prototype.flycoins.push(fc);
		this.pivotObject.add(fc.pivotPosition);
	};

	Player.prototype.update = function() {
		// this.position = level.length/duration*5000;
		this.position = level.length*curLoopTime;
		this.rotation = angle;
		this.obj.rotation.x = rotateDelta*45*TO_RADIANS;
		this.obj.rotation.z = -rotateDelta*180*TO_RADIANS;

		// for (var i = 0; i < Player.prototype.flycoins.length; i++) {
		// 	Player.prototype.flycoins[i].update();
		// };
		parent.update.call(this);
	}
	return Player;
})()