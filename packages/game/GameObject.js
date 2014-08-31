var Vibration = {
	lastTime:0,
	duration:0,
	vibrate:function(duration){
		if(Date.now() > this.lastTime+this.duration){
			this.lastTime = Date.now();
			this.duration = duration;
			navigator.vibrate(duration);
		}
	}
}

var GameObject = (function(){
	function GameObject(parameters,game){
		this.game = game;
		// console.log('game',game);
		this.collided = false;
		this.delta = parameters.delta || 0;
		this.height = parameters.height || 0;
		this.position = parameters.position || 0;
		this.timestamp = parameters.timestamp || 0;
		this.rotation = parameters.rotation || 0;
		this.radius = this.game.tube.radius-this.height;
		this.debug = parameters.debug || false;

		this.obj = new THREE.Object3D();
		this.pivotObject = new THREE.Object3D();
		this.pivotRotate = new THREE.Object3D();
		this.pivotPosition = new THREE.Object3D();


		this.pivotObject.add(this.obj);
		this.pivotRotate.add(this.pivotObject);
		this.pivotPosition.add(this.pivotRotate);


		// console.log(this.position);
		this.calculatedPosition = this.game.tube.spline.getPointAt( this.position/this.game.tube.length );
		this.calculatedDirection = this.game.tube.spline.getTangentAt( this.position/this.game.tube.length );
		// this.radius = this.game.tube.radius-this.height;
		// this.update();
	}
	GameObject.prototype.init = function(parameters) {

		if(parameters){
			this.delta = parameters.delta || 0;
			this.height = parameters.height || 0;
			this.position = parameters.position || 0;
			this.timestamp = parameters.timestamp || 0;
			this.rotation = parameters.rotation || 0;
			this.radius = this.game.tube.radius-this.height;//parameters.radius || 0;
			this.debug = parameters.debug || false;
		}

		// this.pivotObject.rotation.y = 90*TO_RADIANS;
		// this.pivotObject.position.z = -this.radius;
		this.pivotObject.position.x = -this.radius;
		
		
		// this.pivotRotate.rotation.x = this.rotation*TO_RADIANS -90*TO_RADIANS;
		// this.debug = false;
		if(this.debug && !this.debugHelper){
			if(!this.debugHelper){
				this.debugHelper = new DebugHelper(this);
			}
			// this.debugHelper.collided = false;
			this.debugHelper.setPassive();
		}
		this.collided = false;
	};

	GameObject.prototype.update = function() {
		this.calculatedPosition = this.game.tube.spline.getPointAt(this.position/this.game.tube.length);
		this.calculatedDirection = this.game.tube.spline.getTangentAt(this.position/this.game.tube.length);
		this.calculatedDirection = new THREE.Vector3(this.calculatedDirection.x,this.calculatedDirection.y,this.calculatedDirection.z);

		this.pivotPosition.position = this.calculatedPosition;
		var cross = this.calculatedDirection.clone().cross(vectorUp);
		this.pivotPosition.up = cross.clone();
		this.pivotPosition.lookAt(this.calculatedPosition.clone().add(this.calculatedDirection));

		this.pivotRotate.rotation.z = this.rotation*TO_RADIANS -90*TO_RADIANS;
		if(this.debug){
			this.debugHelper.update();
		}
	};
	GameObject.prototype.collideOnCallback = function(){
		// console.log('COLLIDE!');
		// if(this.debug){
		// 	this.debugHelper.setActive();
		// }
	}
	
	GameObject.prototype.add = function(){
		if(!this.added){
			this.game.scene.add(this.pivotPosition);
			this.added = true;
		}
	};

	GameObject.prototype.remove = function(){
		// console.log('remove')
		this.game.scene.remove(this.pivotPosition);
		this.added = false;
	};

	GameObject.prototype.collideOffCallback = function(){
		// if(this.debug){
		// 	this.debugHelper.setPassive();
		// }
	}

	GameObject.prototype.testPassed = function() {
		var delta = getADistance(this.rotation,this.game.angle,360);
		// console.log(delta);
		if(this.debug){
			if(delta < this.delta/2){
				if(!this.debugHelper.collided) this.debugHelper.setActive();
			} else {
				if(this.debugHelper.collided) this.debugHelper.setPassive();
			}
		}


		// console.log(this,'testPassed',this.game.time,this.timestamp);
		if(this.game.time >= this.timestamp){
			Vibration.vibrate(10);
			return true;
		}
		return false;
	};

	GameObject.prototype.testCollide = function() {
		var delta = getADistance(this.rotation,this.game.angle,360);
		if(delta < this.delta/2){
			if(!this.collided){
				this.collided = true;
				if(this.collideOnCallback){this.collideOnCallback();}
			}
		} else {
			// if(this.collided){
			// 	this.collided = false;
				// if(this.collideOffCallback){this.collideOffCallback();}
			// }
			if(this.collideOffCallback){this.collideOffCallback();}
		}
	};
	return GameObject;
})()

var GameObjectStatic = (function(){
	var parent = GameObject.prototype;
	function GameObjectStatic (parameters,game) {
		parent.constructor.call(this,parameters,this.game);
	}
	GameObjectStatic.prototype = Object.create(GameObject.prototype);
	GameObjectStatic.prototype.init = function(parameters){
		parent.init.call(this,parameters);

		this.calculatedPosition = this.game.tube.spline.getPointAt(this.position/this.game.tube.length);
		this.calculatedDirection = this.game.tube.spline.getTangentAt(this.position/this.game.tube.length);
		this.calculatedDirection = new THREE.Vector3(this.calculatedDirection.x,this.calculatedDirection.y,this.calculatedDirection.z);

		this.pivotPosition.position = this.calculatedPosition;
		var cross = this.calculatedDirection.clone().cross(vectorUp);
		this.pivotPosition.up = cross.clone();
		this.pivotPosition.lookAt(this.calculatedPosition.clone().add(this.calculatedDirection));

		this.pivotRotate.rotation.z = this.rotation*TO_RADIANS -90*TO_RADIANS;
		if(this.debug){
			this.debugHelper.update();
		}
	};

	GameObjectStatic.prototype.update = function() {
		this.pivotRotate.rotation.z = this.rotation*TO_RADIANS -90*TO_RADIANS;
		if(this.debug){
			this.debugHelper.update();
		}
	};
	return GameObjectStatic;
})();


var DebugHelper = (function(){
	var MaterialPassive = new THREE.MeshBasicMaterial( { color: 0x00f000, wireframe:false, transparent: true, opacity:0.9 ,side:0} );
	var MaterialActive = new THREE.MeshBasicMaterial( { color: 0xf00000, wireframe:false, transparent: true, opacity:0.9 ,side:0} );
	function DebugHelper(obj){
		this.obj = obj;
		this.collided = false;
		if(obj.delta){
			this.AngleHelper = new THREE.Mesh(new THREE.TorusGeometry(obj.radius,2,2,8,obj.delta*TO_RADIANS),MaterialPassive);

			// this.AngleHelper.rotation.z = -obj.delta*TO_RADIANS/2;
			this.AngleHelper.position.z = 0.01;
			// this.AngleHelper.rotation.z = -90*TO_RADIANS;
			this.obj.obj.add(this.AngleHelper);	
		}
	}
	DebugHelper.prototype.update = function() {
		if(this.obj.delta){
			this.AngleHelper.rotation.z = this.obj.rotation*TO_RADIANS - this.obj.delta*TO_RADIANS/2 + 90*TO_RADIANS;
		}
	};
	DebugHelper.prototype.setActive = function(){
		if(this.AngleHelper){
			this.AngleHelper.material = MaterialActive;
		}
		this.collided = true;
	}

	DebugHelper.prototype.setPassive = function(){
		if(this.AngleHelper){
			this.AngleHelper.material = MaterialPassive;
		}
		this.collided = false;
	}
	return DebugHelper;
})();