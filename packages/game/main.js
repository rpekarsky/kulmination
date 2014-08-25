var renderer = new THREE.WebGLRenderer( { antialias: false } );
var downscale = 1;
var width = window.innerWidth;
var height = window.innerHeight;

// renderer.setClearColor( bgColor );
renderer.setSize( width/downscale, height/downscale );

scene = new THREE.Scene();
document.body.appendChild( renderer.domElement );






var lastX = width/2;
window.onmousemove = function(e){
	lastX = e.x;
	if(e.altKey){
		camera.position.x -= (width/2 -e.x)/130;
		camera.position.y -= (e.y - height/2)/130;
	}
	if(e.ctrlKey){
		camera.position.z += (width/2 -e.x)/130;
		// camera.updateProjectionMatrix();
	}
}

var lastXto = width/2;
window.onkeydown = function(e){
	if(e.keyCode == 37){
		lastXto = 0
		// console.log('left');
	}
	if(e.keyCode == 39){
		lastXto = width;
		// console.log('right');
	}
	// console.log(e.keyCode);
}


window.onkeyup = function(e){
	// 97 // 100
	lastXto = width/2;
	// lastX =width/2;
	// console.log(lastXto);
}

var loopTime = 162000;
// var loopTime = 1000 * 30;
var time;
var curLoopTime;


var lookAtPointNext = 0.06;

debugArrows.prototype.update = function(p) {
	this.vectors = getVectorsOfPoint(p);
	this.meshDir.position = this.vectors.position;
	this.meshDir.setDirection(this.vectors.direction);
	this.meshUp.position = this.vectors.position;
	this.meshUp.setDirection(this.vectors.up);
	this.meshRight.position = this.vectors.position;
	this.meshRight.setDirection(this.vectors.right);
	this.mesh.position = this.vectors.position;
};

var playerOffsetPosition = tubeRadiusScaled-10;
var cameraOffsetPosition = tubeRadiusScaled-50;
var playerCameraOffset = 0.017;

var obstacles = [];

var rotateDelta;



function onDocumentTouchStart(event) {
	if (event.touches.length == 1) {
		event.preventDefault();
		lastX = event.touches[ 0 ].pageX;
		// targetRotationOnMouseDown = targetRotation;
	}
}

function onDocumentTouchMove(event) {

	if (event.touches.length == 1) {

		event.preventDefault();

		lastX = event.touches[ 0 ].pageX;
	}

}

renderer.domElement.addEventListener( 'touchstart', onDocumentTouchStart, false );
renderer.domElement.addEventListener( 'touchmove', onDocumentTouchMove, false );

