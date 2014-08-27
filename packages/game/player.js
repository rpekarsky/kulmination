var Player = (function(){
	var color = 0x101010;
	var bodyMaterial = new THREE.MeshBasicMaterial( { color: color, wireframe:false, transparent: false, opacity: 0.7 } ); 
	var parent = GameObject.prototype;
	function Player(game){
		this.game = game;
		parent.constructor.call(this,{height:5,delta:0,debug:true},this.game);

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

		this.game.scene.add(this.pivotPosition);
	};

	Player.prototype.update = function() {
		// this.position = level.length/duration*5000;
		this.position = this.game.tube.length*this.game.timePosition;
		this.rotation = this.game.angle;
		this.obj.rotation.x = this.game.rotateDelta*45*TO_RADIANS;
		this.obj.rotation.z = -this.game.rotateDelta*180*TO_RADIANS;

		// for (var i = 0; i < Player.prototype.flycoins.length; i++) {
		// 	Player.prototype.flycoins[i].update();
		// };
		parent.update.call(this);
	}
	return Player;
})()