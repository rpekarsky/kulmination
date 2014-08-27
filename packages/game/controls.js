
var Controls = {
	leftPressed:false,
	rightPressed:false,
	DOM: {
		leftControl:document.createElement('div'),
		rightControl:document.createElement('div'),
	}
};

(function(){
	var container = document.createElement('div');
	var left = Controls.DOM.leftControl;
	var right = Controls.DOM.rightControl;
		
	container.className = 'controls';
	left.className = 'control left';
	right.className = 'control right';

	container.appendChild(left);
	container.appendChild(right);

	rightPressedHandler = function(){ console.log('rightPressed'); Controls.rightPressed = true};
	rightReleasedHandler = function(){ console.log('rightReleased'); Controls.rightPressed = false};

	leftPressedHandler = function(){ console.log('leftPressed'); Controls.leftPressed = true};
	leftReleasedHandler = function(){ console.log('leftReleased'); Controls.leftPressed = false};

	right.onmousedown = rightPressedHandler;
	right.onmouseup = right.ondragend = right.onmouseleave = right.onmouseout = rightReleasedHandler;

	left.onmousedown = leftPressedHandler;
	left.onmouseup = left.ondragend = left.onmouseleave = left.onmouseout = leftReleasedHandler;

	document.body.appendChild(container);
})();
//Events 
window.onkeydown = function(e){
	if(e.keyCode == 37){
		Controls.leftPressed = true;
		// lastXto = 0
		// console.log('left');
	}
	if(e.keyCode == 39){
		Controls.rightPressed = true;
		// lastXto = width;
		// console.log('right');
	}
	// console.log(e.keyCode);
}
window.onkeyup = function(e){
	Controls.leftPressed = Controls.rightPressed = false;
	// console.log(Controls);
	// 97 // 100
	// lastXto = width/2;
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


