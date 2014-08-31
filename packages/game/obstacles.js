var DangerOkMaterial = new THREE.MeshBasicMaterial( { color: 0xc0c0c0, wireframe:false, transparent: false ,shading: 1, opacity: 0.6 , fog: true} );
var DangerMaterial = new THREE.MeshBasicMaterial( { color: 0xf0f0f0, wireframe:false, transparent: false ,shading: 1, opacity: 0.6 , fog: true} );
var DangerMaterial2 = new THREE.MeshBasicMaterial( { color: 0xb0d0df, wireframe:false, transparent: false ,shading: 1, opacity: 0.6 , fog: true} );


function Obstacles(game){
	this.game = game;
	this.curCollideTestNum = 0; 
	this.screen = 30; 
	this.screenTime = 2000;//this.game.duration/60;
	this.objects = [];
	this.currentUpdateCount = 0;
	this.Coin.prototype.count = 0;
	this.RotateObstacle.prototype.count = 0;
}
Obstacles.prototype= {
	update:function () {
		
		while(this.objects[this.curCollideTestNum] && this.objects[this.curCollideTestNum].testPassed()){
			this.objects[this.curCollideTestNum].testCollide();
			this.curCollideTestNum++;
			if(this.objects[this.curCollideTestNum+this.screen]) this.objects[this.curCollideTestNum+this.screen].add();
			if(this.objects[this.curCollideTestNum-5]) this.objects[this.curCollideTestNum-5].remove();
		}
		for (var i = this.curCollideTestNum; i < this.curCollideTestNum+this.screen; i++) {
			if(i<this.objects.length){
				this.objects[i].update();	
			}
		};
	},
	update:function () {
		var iter = 0;
		var collideIter = 0;
		this.currentUpdateCount = 0;
		while(this.objects[this.curCollideTestNum+iter]){
			var beat = this.objects[this.curCollideTestNum+iter];
			if(beat.timestamp > this.game.time+this.screenTime) break;
			beat.add();
			beat.update();
			this.currentUpdateCount++;
			if(beat.testPassed()){
				beat.testCollide();
				collideIter++;
				// beat.remove();
				// console.log('gametime',this.game.time);

				if(this.objects[this.curCollideTestNum+iter-5]) this.objects[this.curCollideTestNum+iter-5].remove();
			}
			iter++;
		}
		this.curCollideTestNum += collideIter;
		// for (var i = this.curCollideTestNum; i < this.objects.length; i++) {
		// 	// if(i<this.objects.length){
		// 		this.objects[i].add();	
		// 		this.objects[i].update();	

		// 	// }
		// };
	},
	prepare:function () {
		// for (var i = 0; i < this.screen; i++) {
		// 	if(i<this.objects.length){
		// 		this.objects[i].add();
		// 	}
		// };
	},

	createCoin:function(params){
		if(this.CoinPool && this.CoinPool.length){
			var obs = this.CoinPool.shift();
			obs.init(params);
			// console.log('create from pool');
		} else {
			var obs = new this.Coin(params,this.game);
		}
		obs.update();
		this.objects.push(obs);
		return obs;
	},
	createRotate:function(params){
		if(this.RotatePool && this.RotatePool.length){
			var obs = this.RotatePool.shift();
			obs.init(params);
			// console.log('create from pool');
		} else {
			var obs = new this.RotateObstacle(params,this.game);
		}
		obs.update();
		this.objects.push(obs);
		return obs;
	},
	RotateObstacle:(function(){
		var parent = GameObjectStatic.prototype;
		var BoxGeometry = new THREE.BoxGeometry(1,1,1);
		function RotateObstacle (parameters,game) {
			this.game = game;
			
			this.game.obstacles.RotatePool = this.game.obstacles.RotatePool || [];
			this.pool = this.game.obstacles.RotatePool;

			parameters.height = 0;
			parameters.delta = 30;
			parameters.debug = false;
			parameters.rotation = parameters.startRotation;
			this.speed = parameters.speed;
			this.calculatedSpeed = this.speed/60;

			parent.constructor.call(this,parameters,this.game);

			this.mesh = new THREE.Mesh(BoxGeometry,DangerMaterial);
			
			this.mesh.position.x = this.game.tube.radius-this.game.tube.radius*this.game.tube.outerTubeRadiusCoeff/2;
			// this.mesh.position.z = 1;
			this.mesh.scale.set(this.game.tube.radius*this.game.tube.outerTubeRadiusCoeff,12,4);

			this.obj.add(this.mesh);
			RotateObstacle.prototype.count++;

			this.init(parameters);
		}
		RotateObstacle.prototype = Object.create(parent);
		RotateObstacle.prototype.init = function(parameters){

			parameters.height = 0;
			parameters.delta = 30;
			parameters.debug = false;
			parameters.rotation = parameters.startRotation;
			this.speed = parameters.speed;
			this.calculatedSpeed = this.speed/60;

			parent.init.call(this,parameters);

			// Obstacles.objects.push(this);
		};
		// RotateObstacle.prototype.testCollide = function() {
		// 	GameObject.prototype.testCollide.call(this);
		// };

		RotateObstacle.prototype.collideOnCallback = function() {
			parent.collideOnCallback.call(this);
			// this.game.colorHSL.l = 0;
			this.game.gameCam.shakeValue += 2;
			this.game.gameCam.fovTo = 60;
			this.game.gameCam.fovSpeed = 0.02;
			this.game.SCORE -= 250;
			MPlayer.jamm();
			// scoreHud.setScore(SCORE);
		};

		RotateObstacle.prototype.collideOffCallback = function() {
			parent.collideOffCallback.call(this);
			// colorHSL.h -= 0.3;
			this.game.gameCam.shakeValue += 0.2;
			this.game.SCORE += 50;
			MPlayer.jamm();

			// scoreHud.setScore(SCORE);
			// scoreHud.setScore(SCORE);

			// gameCam.fov = 110;
			// gameCam.fovSpeed = 0.05;
			// colorHSL.l -= 0.1;
			// colorHSL.s = 1//colorHSLMain.s+0.2;
		};

		RotateObstacle.prototype.add = function(){
			for (var i = 0; i < this.pool.length; i++) {
				if (this.pool[i] == this){
					this.pool.splice(i,1);
					break;
				}
			};
			parent.add.call(this);
		}

		RotateObstacle.prototype.remove = function(){
			parent.remove.call(this);
			this.pool.push(this);
		}
		RotateObstacle.prototype.update = function(){
			this.rotation += this.calculatedSpeed;
			parent.update.call(this);	
		};
		return RotateObstacle;
	})(),

	Coin:(function(){
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
		function Coin (parameters,game) {
			// console.log('new Coin');
			this.game = game;
			this.mesh = new THREE.Mesh(CoinGeometry,CoinMaterial);
			this.mesh.rotation.z = -5/2*TO_RADIANS;
			this.meshColor = new THREE.Mesh(CoinColorGeometry,
				(this.big)?CoinBigColorMaterial:CoinColorMaterial
				);

			this.game.obstacles.CoinPool = this.game.obstacles.CoinPool || [];
			this.pool = this.game.obstacles.CoinPool;

			// parameters.radius = 30;
			parameters.height = this.game.tube.radius;
			parameters.delta = 45;
			parameters.debug = false;
			parameters.rotation = parameters.startRotation;
			this.big = parameters.big || false;
			this.calculatedSpeed = parameters.speed/60;

			parent.constructor.call(this,parameters,this.game);

			this.obj.add(this.mesh);
			this.obj.add(this.meshColor);
			this.obj.rotation.z = 180*TO_RADIANS - CoinDelta/2*TO_RADIANS;
			// this.obj.z = -tubeRadius;
			this.obj.scale.set(1,1,8);
			Coin.prototype.count++;
			this.init(parameters);
		}
		Coin.prototype = Object.create(parent);
		Coin.prototype.count = 0;
		Coin.prototype.init = function(parameters){
			// this.position = parameters.position || 0;

			parameters.height = this.game.tube.radius;
			parameters.delta = 45;
			parameters.debug = true;
			parameters.rotation = parameters.startRotation;
			

			this.meshColor.material = CoinColorMaterial;
			parent.init.call(this,parameters);

			// Obstacles.objects.push(this);
			
			// this.game.scene.add(this.pivotPosition);

		};

		Coin.prototype.collideOnCallback = function() {
			parent.collideOnCallback.call(this);
			// colorHSLMain.h = (colorHSLMain.h+0.1)%1;//Math.random();
			// colorHSL.l -= 0.1;
			this.meshColor.material = CoinCollectedMaterial;
			this.game.gameCam.fovTo += 5;
			this.game.gameCam.fovSpeed = 0.02
			this.game.gameCam.shakeValue += 0.02;
			this.game.SCORE += 100;
			// scoreHud.setScore(SCORE);
		};

		Coin.prototype.update = function(){
			parent.update.call(this);	
			// this.rotation += this.calculatedSpeed;
		};

		Coin.prototype.add = function(){
			if(!this.added){
				for (var i = 0; i < this.pool.length; i++) {
					if (this.pool[i] == this){
						this.pool.splice(i,1);
						break;
					}
				};
			}
			parent.add.call(this);
		};
		Coin.prototype.remove = function(){
			this.pool.push(this);
			parent.remove.call(this);
		};
		return Coin;
	})(),
}