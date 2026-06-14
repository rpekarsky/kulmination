var Obstacles = {
	objects:[],
}

var DangerOkMaterial = new THREE.MeshBasicMaterial( { color: 0xc0c0c0, wireframe:false, transparent: false ,shading: 1, opacity: 0.6 , fog: true} );
var DangerMaterial = new THREE.MeshBasicMaterial( { color: 0xf0f0f0, wireframe:false, transparent: false ,shading: 1, opacity: 0.6 , fog: true} );
var DangerMaterial2 = new THREE.MeshBasicMaterial( { color: 0xb0d0df, wireframe:false, transparent: false ,shading: 1, opacity: 0.6 , fog: true} );


Obstacles.SCALE = 3;
Obstacles.curCollideTestNum = 0;
Obstacles.screen = 30;
Obstacles.trackFinished = false;
Obstacles.update = function () {
	while(this.objects[Obstacles.curCollideTestNum] && this.objects[Obstacles.curCollideTestNum].testPassed()){
		var obj = this.objects[Obstacles.curCollideTestNum];
		obj.testCollide();

		// Per-element score event at the moment the obstacle slides past the
		// player. testCollide above already flipped obj.collided if the
		// player was in its delta zone earlier — read that flag now.
		if (obj.kind === 'coin') {
			if (obj.collided) {
				scoring.pickup(100);
				if (typeof player !== 'undefined' && player.flashCoin) player.flashCoin();
			}
			// missed coin: silent, no penalty
		} else {
			if (obj.collided) {
				scoring.hit();
				if (typeof SFX !== 'undefined') SFX.play('damage');
			} else {
				gameCam.shakeValue += 0.2;
				if (typeof SFX !== 'undefined') SFX.play('whoosh');
			}
		}

		Obstacles.curCollideTestNum++;
		if(this.objects[Obstacles.curCollideTestNum+Obstacles.screen]) this.objects[Obstacles.curCollideTestNum+Obstacles.screen].add();
		if(this.objects[Obstacles.curCollideTestNum-Obstacles.screen/2]) this.objects[Obstacles.curCollideTestNum-Obstacles.screen/2].remove();
	}

	// End of track: last block has been flushed. Save highscore once, then
	// emit `track-finished` so the menu (hint card) can reappear.
	if (!Obstacles.trackFinished && Obstacles.curCollideTestNum >= this.objects.length && this.objects.length > 0) {
		Obstacles.trackFinished = true;
		scoring.maybeSaveBest();
		window.dispatchEvent(new CustomEvent('track-finished'));
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
		
		this.mesh.position.x = tubeRadius - tubeRadius*outerTubeRadiusCoeff/2;
		// this.mesh.position.z = 1;
		this.mesh.scale.set(tubeRadius*outerTubeRadiusCoeff,12,4);

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

	RotateObstacle.prototype.kind = 'obstacle';
	// Edge-trigger only: fires once when the player first overlaps this
	// obstacle's angular zone. Just visual flash + camera shake here — the
	// scoring.hit() call and explosion SFX both happen later in
	// Obstacles.update, which dedupes the SFX so a block of 3 doesn't stack
	// three explosion sounds on top of each other.
	RotateObstacle.prototype.collideOnCallback = function() {
		parent.collideOnCallback.call(this);
		colorHSL.l = 0;
		gameCam.shakeValue += 2;
		gameCam.fovTo = 60;
		gameCam.fovSpeed = 0.02;
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
		parameters.height = tubeRadius;
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

	Coin.prototype.kind = 'coin';
	Coin.prototype.collideOnCallback = function() {
		parent.collideOnCallback.call(this);
		colorHSLMain.h = (colorHSLMain.h+0.1)%1;//Math.random();
		// colorHSL.l -= 0.1;
		this.meshColor.material = CoinCollectedMaterial;

		gameCam.fovTo += 5;
		gameCam.fovSpeed = 0.02
		gameCam.shakeValue += 0.02;
		if (typeof SFX !== 'undefined') SFX.play(this.big ? 'blip2' : 'blip');
	};

	Coin.prototype.update = function(){
		parent.update.call(this);	
		// this.rotation += this.calculatedSpeed;
	};
	return Coin;
})();



// Obstacles.MultyObstacle=(function(){
	
// 	function MultyObstacle (parameters) {
// 		this.position = parameters.position || 0;
// 		this.type = parameters.type;
// 		this.startRotation = parameters.startRotation || 0;
// 		this.timestamp = parameters.timestamp || 0;
// 		this.calculatedPosition = spline.getPointAt(this.position/level.length);
// 		this.calculatedDirection = spline.getTangentAt(this.position/level.length);
// 		// this.torus = new THREE.Mesh(new THREE.TorusGeometry(tubeRadius,1,3,24),DangerMaterial);
// 		this.number = parameters.number || 3;
// 		this.speed = parameters.speed || 0;
// 		this.radius = tubeRadius;
// 		this.pivot = new THREE.Object3D();
// 		this.childs = [];
// 		this.init();
// 	}
// 	MultyObstacle.prototype.init = function(){
// 		var mesh;
// 		for (var i = 1; i <= this.number; i++) {
// 			var start = 360/this.number*TO_RADIANS*i+this.startRotation;
// 			mesh = new Obstacles.RotateObstacle({
// 				speed:this.speed,
// 				position:this.position,
// 				startRotation:start,
// 				timestamp:this.timestamp,
// 				type:this.type
// 			});
// 			// mesh.pivotRotate.rotation.z = 360/this.number*TO_RADIANS*i; 
// 			this.childs.push(mesh);
// 		};
// 		// this.torus.position = this.calculatedPosition;
// 		// this.torus.lookAt(this.calculatedPosition.clone().add(this.calculatedDirection));
		
// 		// this.pivot.rotation.x = (Math.random()*360)*TO_RADIANS;
// 		// scene.add(this.pivot);
// 		// scene.add(this.torus);
// 		// Obstacles.objects.push(this);
// 	};
// 	MultyObstacle.prototype.testCollide = function(obj) {
		
// 	};

// 	MultyObstacle.prototype.update = function(){
// 		// console.log('mul update');
// 		// if(this.number == 3){
// 			for (var i = 0; i < this.childs.length; i++) {
// 				this.childs[i].update();
// 			};
// 		// }
// 		// this.pivot.rotation.x += 90*TO_RADIANS/60;
// 	};
// 	return MultyObstacle;
// })();