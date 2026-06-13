var renderer = new THREE.WebGLRenderer( { antialias: false } );
var downscale = 1;
var width = window.innerWidth;
var height = window.innerHeight;
var bgColor = 0xa0a0a0

renderer.setClearColor( bgColor );
renderer.setSize( width/downscale, height/downscale );
// renderer.domElement.width = width;
// renderer.domElement.height = height;
// renderer.domElement.style.width ='100%';
// renderer.domElement.style.height = '100%';
// renderer.shadowMapEnabled = true;
// renderer.shadowMapType = THREE.PCFShadowMap;
// renderer.sortObjects = false;

var camera = new THREE.PerspectiveCamera( 90, width / height, 1, 1000000 );//new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
var camera2 = new THREE.PerspectiveCamera( 90, width / height, 1, 1000000 );
camera.position.set(50, 50, 50);
camera.up = new THREE.Vector3(0,0,1);
camera.lookAt(new THREE.Vector3(0,0,0));

scene = new THREE.Scene();

scene.add( camera );


document.body.appendChild( renderer.domElement );







var geometry = new THREE.BoxGeometry(100,100,10,1,1,1); 
var material = new THREE.MeshLambertMaterial( { color: 0x101010, wireframe:false, transparent: false, side:1 } ); 
var cube = new THREE.Mesh( geometry, material ); 
var debugMaterial = new THREE.MeshBasicMaterial( { color: 0xffaa00, wireframe:false, transparent: true } ); 
// scene.add( cube ); 
// scene.add( pipeSpline ); 

// var pointLight = new THREE.PointLight( 0xffffff, 10, 900 );
// scene.add( pointLight );
// pointLight.position.set( 10, 10, 10 );

// tubeMesh.scale.set(scale,scale,scale);
// tubeMesh.material.opacity = 0.3
// tubeMesh.
// scene.add(tubeMesh);


// var pointA = ;


function addDebugPoint(v){
	var obj = new THREE.SphereGeometry(3,1,1);
	var mesh = new THREE.Mesh(obj,debugMaterial);
	mesh.position = v;
	mesh.position.multiplyScalar(scale);
	scene.add(mesh);
}
// var axis = new THREE.AxisHelper(150);
// scene.add(axis);

var angle = 0;
var pointA = spline.getPointAt(0.45);
var pointB = spline.getPointAt(0.65);
// addDebugPoint(new THREE.Vector3(0,0,0));

// addDebugPoint(pointB);
// addDebugPoint(pointA);

// var direction = spline.getTangentAt(0.65);
// var directionCross = direction.clone().cross(new THREE.Vector3(0,0,1));

// // scene.add(new THREE.ArrowHelper(direction.normalize(),pointA,50,0xffff00,50/2,10));
// scene.add(new THREE.ArrowHelper(direction,pointB,50,0xffff00,50/2,6));
// scene.add(new THREE.ArrowHelper(directionCross,pointB,50,0xff00ff,50/2,6));
// scene.add(new THREE.ArrowHelper(directionCross.clone().applyAxisAngle(direction,-1.2),pointB,50,0xff0000,50/2,6));

var lastX = width/2;
window.onmousemove = function(e){
	// console.log(e);
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


function debugArrows(p){
	this.vectors = getVectorsOfPoint(p);
	this.meshDir = new THREE.ArrowHelper(this.vectors.direction,this.vectors.position,50,0x00ffff,50/2,10);
	this.meshUp = new THREE.ArrowHelper(this.vectors.up,this.vectors.position,50,0x0000ff,50/2,10);
	this.meshRight = new THREE.ArrowHelper(this.vectors.right,this.vectors.position,50,0xff0000,50/2,10);
	this.meshGeom = new THREE.CubeGeometry(1,1,1);
	this.mesh = new THREE.MeshBasicMaterial(this.meshGeom,debugMaterial);
	scene.add(this.mesh);
	scene.add(this.meshUp);
	scene.add(this.meshDir);
	scene.add(this.meshRight);
}

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

camera2.up = vectorUp;
// var debugPoint = new debugArrows(0);
var playerOffsetPosition = tubeRadiusScaled-10;
var cameraOffsetPosition = tubeRadiusScaled-50;
var playerCameraOffset = 0.017;
var quat = new THREE.Quaternion();

// tubeMesh.visible = false;


function mainLoop(v){
	angle = 0;
	var playerVectors = getVectorsOfPoint(v+playerCameraOffset);
	var cameraVectors = getVectorsOfPoint(v);
	var lookAtPoint = getVectorsOfPoint(v+lookAtPointNext);
	camera2.position = cameraVectors.position.add(cameraVectors.up.clone().applyAxisAngle(cameraVectors.direction,angle).multiplyScalar(cameraOffsetPosition));
	// camera2.position = playerVectors.position.clone().add(playerVectors.direction.clone().multiplyScalar(cameraOffsetPosition).negate());
	camera2.up = cameraVectors.up.clone().applyAxisAngle(cameraVectors.direction,angle).normalize().negate();
	camera2.lookAt(lookAtPoint.position);


	player.obj.position = playerVectors.position;
	player.obj.position.add(playerVectors.up.clone().applyAxisAngle(playerVectors.direction,angle).multiplyScalar(playerOffsetPosition));
	

	player.obj.up = camera2.up;

	var tt = Date.now()/1000;
	// player.obj.lookAt(lookAtPoint.position);
	// player.obj.quaternion.multiply(quat.setFromAxisAngle(playerVectors.direction,rotateDelta*Math.PI*2));
	// player.obj.quaternion.setFromAxisAngle(playerVectors.up,tt);

	// var camOffset = lookAtPoint.position.clone().divide(cameraVectors.position).projectOnPlane(cameraVectors.direction).negate();
	// projectOnPlane.setDirection(camOffset);
	// camera2.position.add(camOffset.clone().multiplyScalar(tubeRadiusScaled*2));
	// playerM.position.multiplyScalar(scale);
	// playerM.position.add(directionCross.clone().applyAxisAngle(direction,angle).multiplyScalar(tubeRadius*scale));
	
	debugPoint.update(v+lookAtPointNext);
	// pointLight.position = depugPointM.position;
	// camera2.lookAt(camera2.position.clone().add(direction.clone().multiplyScalar(10)));
}


var obstaclesSize = 15;
var obstaclesMaterial = new THREE.MeshLambertMaterial( { color: 0x200000, wireframe:false, transparent: false, opacity: 0.4 } ); 
var obstacles = [];

var mainCamera = camera;
var timeoff = 0;
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

