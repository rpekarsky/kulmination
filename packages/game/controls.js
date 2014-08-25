
//Events 

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


