
var Controls = {
	leftPressed:false,
	rightPressed:false,
	DOM: {
		leftControl:document.createElement('div'),
		rightControl:document.createElement('div'),
	},
	show:function(){
		this.DOM.leftControl.style.display = 'block';
		this.DOM.rightControl.style.display = 'block';
	},
	hide:function(){
		this.DOM.leftControl.style.display = 'none';
		this.DOM.rightControl.style.display = 'none';
	},
	init:function(){
		var container = document.createElement('div');
		var left = this.DOM.leftControl;
		var right = this.DOM.rightControl;
			
		container.className = 'controls';
		left.className = 'control left';
		right.className = 'control right';

		container.appendChild(left);
		container.appendChild(right);

		rightPressedHandler = function(){ Controls.rightPressed = true};
		rightReleasedHandler = function(){ Controls.rightPressed = false};

		leftPressedHandler = function(){ Controls.leftPressed = true};
		leftReleasedHandler = function(){ Controls.leftPressed = false};

		right.onmousedown = right.ontouchstart = rightPressedHandler;
		right.onmouseup = right.ontouchend = right.ondragend = right.onmouseleave = right.onmouseout = rightReleasedHandler;

		left.onmousedown = left.ontouchstart = leftPressedHandler;
		left.onmouseup = left.ontouchend = left.ondragend = left.onmouseleave = left.onmouseout = leftReleasedHandler;

		document.body.appendChild(container);
		this.hide();
	}
};
//Events 
window.onkeydown = function(e){
	if(e.keyCode == 37){
		Controls.leftPressed = true;
	}
	if(e.keyCode == 39){
		Controls.rightPressed = true;
	}
}
window.onkeyup = function(e){
	Controls.leftPressed = Controls.rightPressed = false;
}
// function onDocumentTouchStart(event) {
// 	if (event.touches.length == 1) {
// 		event.preventDefault();
// 		lastX = event.touches[ 0 ].pageX;
// 		// targetRotationOnMouseDown = targetRotation;
// 	}
// }
// function onDocumentTouchMove(event) {

// 	if (event.touches.length == 1) {

// 		event.preventDefault();

// 		lastX = event.touches[ 0 ].pageX;
// 	}
// }
// document.body.addEventListener( 'touchstart', onDocumentTouchStart, false );
// document.body.addEventListener( 'touchmove', onDocumentTouchMove, false );


