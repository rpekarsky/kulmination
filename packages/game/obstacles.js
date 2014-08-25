var Obstacles = {
	objects:[],
}

var DangerOkMaterial = new THREE.MeshBasicMaterial( { color: 0xc0c0c0, wireframe:false, transparent: false ,shading: 1, opacity: 0.6 , fog: true} );
var DangerMaterial = new THREE.MeshBasicMaterial( { color: 0xf0f0f0, wireframe:false, transparent: false ,shading: 1, opacity: 0.6 , fog: true} );
var DangerMaterial2 = new THREE.MeshBasicMaterial( { color: 0xb0d0df, wireframe:false, transparent: false ,shading: 1, opacity: 0.6 , fog: true} );


Obstacles.SCALE = 3; 
Obstacles.curCollideTestNum = 0; 
Obstacles.screen = 30; 
Obstacles.update = function () {
	while(this.objects[Obstacles.curCollideTestNum] && this.objects[Obstacles.curCollideTestNum].testPassed()){
		this.objects[Obstacles.curCollideTestNum].testCollide();
		Obstacles.curCollideTestNum++;
		if(this.objects[Obstacles.curCollideTestNum+Obstacles.screen]) this.objects[Obstacles.curCollideTestNum+Obstacles.screen].add();
		if(this.objects[Obstacles.curCollideTestNum-Obstacles.screen/2]) this.objects[Obstacles.curCollideTestNum-Obstacles.screen/2].remove();
	}
	for (var i = Obstacles.curCollideTestNum; i < Obstacles.curCollideTestNum+Obstacles.screen; i++) {
		if(i<this.objects.length){
			this.objects[i].update();			
		}
	};
}
Obstacles.prepare = function () {

	for (var i = 0; i < Obstacles.screen; i++) {
		if(i<this.objects.length){
			this.objects[i].add();
		}
	};
}

Obstacles.RotateObstacle=(function(){
	var parent = GameObject.prototype;
	var BoxGeometry = new THREE.BoxGeometry(1,1,1);
	function RotateObstacle (parameters) {

		parameters.height = 0;
		parameters.delta = 30;
		parameters.debug = false;
		parameters.rotation = parameters.startRotation;
		parent.constructor.call(this,parameters);

		this.speed = parameters.speed;
		this.calculatedSpeed = this.speed/60;

		this.mesh = new THREE.Mesh(BoxGeometry,DangerMaterial);
		
		this.mesh.position.x = tube.radius-tube.radius*tube.outerTubeRadiusCoeff/2;
		// this.mesh.position.z = 1;
		this.mesh.scale.set(tube.radius*tube.outerTubeRadiusCoeff,12,4);

		this.obj.add(this.mesh);

		this.init();
	}
	RotateObstacle.prototype = Object.create(parent);
	RotateObstacle.prototype.init = function(){

		parent.init.call(this);

		Obstacles.objects.push(this);
	};
	// RotateObstacle.prototype.testCollide = function() {
	// 	GameObject.prototype.testCollide.call(this);
	// };

	RotateObstacle.prototype.collideOnCallback = function() {
		parent.collideOnCallback.call(this);
		colorHSL.l = 0;
		gameCam.shakeValue += 2;
		gameCam.fovTo = 60;
		gameCam.fovSpeed = 0.02;
		SCORE -= 250;
		// scoreHud.setScore(SCORE);
	};
	RotateObstacle.prototype.collideOffCallback = function() {
		parent.collideOffCallback.call(this);
		// colorHSL.h -= 0.3;
		gameCam.shakeValue += 0.2;
		SCORE += 50;
		// scoreHud.setScore(SCORE);
		// scoreHud.setScore(SCORE);

		// gameCam.fov = 110;
		// gameCam.fovSpeed = 0.05;
		// colorHSL.l -= 0.1;
		// colorHSL.s = 1//colorHSLMain.s+0.2;
	};
	RotateObstacle.prototype.update = function(){
		this.rotation += this.calculatedSpeed;
		parent.update.call(this);	
	};
	return RotateObstacle;
})();

Obstacles.Coin=(function(){
	var collectedColor = new THREE.Color(0x0090ff);
	var collectedColorHSL = collectedColor.getHSL();
	var color = new THREE.Color(0xffffff).setHSL(collectedColorHSL.h,collectedColorHSL.s-0.3,collectedColorHSL.l-0.4);

	var CoinMaterial = new THREE.MeshBasicMaterial( { color: 0xf0f0f0, transparent: true, opacity: 0.8} );
	var CoinColorMaterial = new THREE.MeshBasicMaterial( { color: color } );
	var CoinCollectedMaterial = new THREE.MeshBasicMaterial( { color: collectedColor } );
	
	var CoinBigColorMaterial = new THREE.MeshBasicMaterial( { color: 0x00ffff } );

	var CoinDelta = 45
	var CoinGeometry = new THREE.TorusGeometry(30+3,2,4,8,(CoinDelta+5)*TO_RADIANS);
	var CoinColorGeometry = new THREE.TorusGeometry(30,1,4,8,CoinDelta*TO_RADIANS);

	var parent = GameObject.prototype;
	function Coin (parameters) {
		parameters.height = tube.radius;
		parameters.delta = 45;
		parameters.debug = false;
		parameters.rotation = parameters.startRotation;
		this.big = parameters.big || false;
		this.calculatedSpeed = parameters.speed/60;
		parent.constructor.call(this,parameters);

		
		this.mesh = new THREE.Mesh(CoinGeometry,CoinMaterial);
		this.mesh.rotation.z = -5/2*TO_RADIANS;
		this.meshColor = new THREE.Mesh(CoinColorGeometry,
			(this.big)?CoinBigColorMaterial:CoinColorMaterial
			);
		
		this.obj.add(this.mesh);
		this.obj.add(this.meshColor);
		this.obj.rotation.z = 180*TO_RADIANS - CoinDelta/2*TO_RADIANS;
		// this.obj.z = -tubeRadius;
		this.obj.scale.set(1,1,8);

		this.init();
	}
	Coin.prototype = Object.create(GameObject.prototype);
	Coin.prototype.init = function(){
		parent.init.call(this);

		Obstacles.objects.push(this);
		
		// scene.add(this.pivotPosition);

	};

	Coin.prototype.collideOnCallback = function() {
		parent.collideOnCallback.call(this);
		colorHSLMain.h = (colorHSLMain.h+0.1)%1;//Math.random();
		// colorHSL.l -= 0.1;
		this.meshColor.material = CoinCollectedMaterial;

		gameCam.fovTo += 5;
		gameCam.fovSpeed = 0.02
		gameCam.shakeValue += 0.02;
		SCORE += 100;
		// scoreHud.setScore(SCORE);
	};

	Coin.prototype.update = function(){
		parent.update.call(this);	
		// this.rotation += this.calculatedSpeed;
	};
	return Coin;
})();

