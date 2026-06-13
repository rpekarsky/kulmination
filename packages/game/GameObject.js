
var GameObject = (function(){
	function GameObject(parameters){
		this.collided = false;
		this.delta = parameters.delta || 0;
		this.height = parameters.height || 0;
		this.position = parameters.position || 0;
		this.timestamp = parameters.timestamp || 0;
		this.rotation = parameters.rotation || 0;
		this.radius = tubeRadius-this.height;
		this.debug = parameters.debug || false;

		this.obj = new THREE.Object3D();
		this.pivotObject = new THREE.Object3D();
		this.pivotRotate = new THREE.Object3D();
		this.pivotPosition = new THREE.Object3D();

		this.calculatedPosition = spline.getPointAt(this.position/level.length);
		this.calculatedDirection = spline.getTangentAt(this.position/level.length);
		this.radius = tubeRadius-this.height;
		// this.update();
	}
	GameObject.prototype.init = function() {
		this.pivotObject.add(this.obj);
		this.pivotRotate.add(this.pivotObject);
		this.pivotPosition.add(this.pivotRotate);

		// this.pivotObject.rotation.y = 90*TO_RADIANS;
		// this.pivotObject.position.z = -this.radius;
		this.pivotObject.position.x = -this.radius;
		
		// this.pivotRotate.rotation.x = this.rotation*TO_RADIANS -90*TO_RADIANS;
		// this.debug = false;
		if(this.debug){
			this.debugHelper = new DebugHelper(this);
		}
		
	};

	GameObject.prototype.update = function() {
		this.calculatedPosition = spline.getPointAt(this.position/level.length);
		this.calculatedDirection = spline.getTangentAt(this.position/level.length);
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
		scene.add(this.pivotPosition);
	};

	GameObject.prototype.remove = function(){
		scene.remove(this.pivotPosition);
	};

	GameObject.prototype.collideOffCallback = function(){
		// if(this.debug){
		// 	this.debugHelper.setPassive();
		// }
	}

	GameObject.prototype.testPassed = function() {
		var delta = getADistance(this.rotation,angle,360);
		if(this.debug){
			if(delta < this.delta/2){
				if(!this.debugHelper.collided) this.debugHelper.setActive();
			} else {
				if(this.debugHelper.collided) this.debugHelper.setPassive();
			}
		}

		// Use the same smoothed time the visual rendering uses
		// (getSmoothedAudioTime in loop.js — wall-clock interpolation between
		// Firefox's coarse audio.currentTime steps). Otherwise testPassed lags
		// the smoothed clock by up to ~100ms and the player visually passes
		// through the obstacle before the collider catches up.
		if(getSmoothedAudioTime()*1000 >= this.timestamp){
			return true;
		}
		return false;
	};

	GameObject.prototype.testCollide = function() {
		var delta = getADistance(this.rotation,angle,360);
		// Edge-trigger: collideOnCallback fires ONCE on the leading edge of the
		// collision zone. The old code also ran collideOffCallback every frame
		// the player wasn't overlapping — that caused pass.wav + +50 score to
		// stack on every visible RotateObstacle every frame. Per-block "you
		// avoided this" / "you got hit" is now decided in Obstacles.update.
		if(delta < this.delta/2 && !this.collided){
			this.collided = true;
			if(this.collideOnCallback){this.collideOnCallback();}
		}
	};
	return GameObject;
})()


var DebugHelper = (function(){
	var MaterialPassive = new THREE.MeshBasicMaterial( { color: 0xf00000, wireframe:false, transparent: false, opacity:0.2 ,side:0} );
	var MaterialActive = new THREE.MeshBasicMaterial( { color: 0xf00000, wireframe:false, transparent: false, opacity:0.9 ,side:0} );
	function DebugHelper(obj){
		this.obj = obj;
		this.collided = false;
		if(obj.delta){
			this.AngleHelper = new THREE.Mesh(new THREE.TorusGeometry(obj.radius,2,2,8,obj.delta*TO_RADIANS),MaterialPassive);

			// this.AngleHelper.rotation.z = -obj.delta*TO_RADIANS/2;
			this.AngleHelper.position.z = 0.01;
			// this.AngleHelper.rotation.z = -90*TO_RADIANS;
			obj.pivotPosition.add(this.AngleHelper);	
		}
	}
	DebugHelper.prototype.update = function() {
		if(this.obj.delta){
			this.AngleHelper.rotation.z = this.obj.rotation*TO_RADIANS - this.obj.delta*TO_RADIANS/2 + 90*TO_RADIANS;
		}
	};
	DebugHelper.prototype.setActive = function(){
		this.AngleHelper.material = MaterialActive;
	}

	DebugHelper.prototype.setPassive = function(){
		this.AngleHelper.material = MaterialPassive;
	}
	return DebugHelper;
})();