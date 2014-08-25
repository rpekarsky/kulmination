hudRenderer = new THREE.CSS3DRenderer();
hudCamera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 1, 10000 );
hudCamera.position.z = 300;
hudScene = new THREE.Scene();
hudWrapper = new THREE.Object3D();
hudScene.add(hudWrapper);

var hudObject = (function () {
	function hudObject(dom){
		this.css3obj = new THREE.CSS3DObject( dom );
		this.objPos = new THREE.Object3D();
		this.objRotation = new THREE.Object3D();
		this.objScale = new THREE.Object3D();

		this.objPos.add(this.objRotation);
		this.objRotation.add(this.objScale);
		this.objScale.add(this.css3obj);

		hudWrapper.add(this.objPos);
	}

	return hudObject;
})();


var HudScore = (function () {
	function HudScore(dom){
		this.dom = document.createElement('div');
		this.dom.className = 'score-hud';
		this.scale = 1;
		
		this.object = new hudObject(this.dom);
		this.object.objPos.position.y = 250;
		this.object.objPos.position.z = 50;

		this.object.objRotation.rotation.x = -3*TO_RADIANS
	}
	HudScore.prototype.setScore = function(score) {
		this.dom.textContent = score;
		this.scale += 0.5;
	};
	HudScore.prototype.update = function() {
		this.scale += (1 - this.scale)*0.1;
		this.object.objScale.scale.set(this.scale,this.scale,1);
	};
	return HudScore;
})();

var HudMultipler = (function () {
	function HudMultipler(dom){
		this.dom = document.createElement('div');
		this.dom.className = 'multipler-hud';
		this.progress = document.createElement('div');
		this.multipler = document.createElement('div');
		this.dom.appendChild(this.progress);
		this.dom.appendChild(this.multipler);
		this.scale = 1;
		
		this.object = new hudObject(this.dom);
		this.object.objPos.position.y = 250;
		this.object.objPos.position.z = 50;
		this.object.objPos.position.x = 250;
		this.object.objRotation.rotation.x = -3*TO_RADIANS
		this.multipler.textContent = 'x3';
		this.progress.textContent = '0.2';
	}
	HudMultipler.prototype.setScore = function(score) {
	};
	HudMultipler.prototype.update = function() {
	};
	return HudMultipler;
})();


var scoreHud = new HudScore();



hudRenderer.setSize( window.innerWidth, window.innerHeight );
hudRenderer.domElement.style.position = 'absolute';
hudRenderer.domElement.style.top = '0px';