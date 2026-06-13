hudRenderer = new THREE.CSS3DRenderer();
hudCamera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 1, 10000 );
hudCamera.position.z = 300;
// hudCamera.position.x = 450;
// hudCamera.position.y = -100;
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
	function HudMultipler(){
		this.dom = document.createElement('div');
		this.dom.className = 'score-hud';
		this.dom.style.fontSize = '32pt';        // bigger than score's 20pt
		this.scale     = 1;
		this.baseScale = 1;
		this.multiplier = 1;

		this.object = new hudObject(this.dom);
		// Bottom-right corner: positive X, negative Y in hudScene coords.
		this.object.objPos.position.x =  250;
		this.object.objPos.position.y = -250;
		this.object.objPos.position.z =   50;
		this.object.objRotation.rotation.x = -3*TO_RADIANS;
		this.dom.textContent = '';
	}
	HudMultipler.prototype.setMultiplier = function(m){
		this.multiplier = m;
		if (m <= 1) {
			this.dom.textContent = '';
			this.baseScale = 0;                  // hide while at 1
		} else {
			this.dom.textContent = 'x' + m;
			// Grows with multiplier, capped so it doesn't overflow the screen.
			this.baseScale = 1 + Math.min(m - 1, 7) * 0.18;
		}
	};
	// Pop on multiplier increment.
	HudMultipler.prototype.bump = function(){
		this.scale = this.baseScale + 0.9;
	};
	HudMultipler.prototype.update = function(){
		this.scale += (this.baseScale - this.scale) * 0.1;
		this.object.objScale.scale.set(this.scale, this.scale, 1);
	};
	return HudMultipler;
})();

var HudBest = (function () {
	function HudBest(){
		this.dom = document.createElement('div');
		this.dom.className = 'score-hud';
		this.dom.style.fontSize = '14pt';
		this.dom.style.opacity = '0.7';
		this.scale = 1;

		this.object = new hudObject(this.dom);
		// Top-left corner of the HUD.
		this.object.objPos.position.x = -250;
		this.object.objPos.position.y =  250;
		this.object.objPos.position.z =   50;
		this.object.objRotation.rotation.x = -3*TO_RADIANS;
		this.dom.textContent = '';
	}
	HudBest.prototype.setBest = function(n){
		this.dom.textContent = n ? ('BEST ' + n) : '';
	};
	HudBest.prototype.update = function(){};
	return HudBest;
})();


var scoreHud     = new HudScore();
var multiplerHud = new HudMultipler();
var bestHud      = new HudBest();


hudRenderer.setSize( window.innerWidth, window.innerHeight );
hudRenderer.domElement.style.position = 'absolute';
hudRenderer.domElement.style.top = '0px';