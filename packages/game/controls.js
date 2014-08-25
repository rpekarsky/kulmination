
//Events 
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
document.body.addEventListener( 'touchstart', onDocumentTouchStart, false );
document.body.addEventListener( 'touchmove', onDocumentTouchMove, false );


