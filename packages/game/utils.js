var vectorUp = new THREE.Vector3(0,0,1);
var TO_RADIANS = Math.PI/180;
function getVectorsOfPoint(p){
	var position = spline.getPointAt(p%1)
		.multiplyScalar(scale);
	var dir = spline.getTangentAt(p%1);
	var right = dir.clone().cross(vectorUp).normalize();
	var up = dir.clone().cross(right).negate();
	return {
		position:position,
		direction:dir,
		right:right,
		up:up
	};
}


function getADistance(a,b,c){
	return Math.min( Math.abs(a%c-b%c),Math.abs(Math.abs(a%c-b%c)-c) );
}