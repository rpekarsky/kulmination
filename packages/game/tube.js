
function Tube(){
	
}

var tubeRadius = 30;
var tubeRadiusScaled = tubeRadius;

var outerTubeRadiusCoeff = 4.5;

var splinePoints = [];
var splineRadius = duration/(Math.PI*2)*0.4;


var points = Math.floor(duration/1000/2);
for (var i = 0; i < points; i++) {
	splinePoints.push(
		new THREE.Vector4(
			Math.sin(Math.PI*2*i/points)*splineRadius,
			Math.cos(Math.PI*2*i/points)*splineRadius,
			(Math.random()*2-1)*splineRadius/60,
			tubeRadius*outerTubeRadiusCoeff));
};

var spline = new THREE.ClosedSplineCurve4(splinePoints);

var level = {
	length: spline.getLength()
}

var tube = new THREE.TubeGeometry(spline,Math.floor(level.length/128), 16, true, false);

var tubeMat = new THREE.MeshBasicMaterial( { color: 0x303030	, wireframe:false, transparent: false, side:1} );
var tubeMat = new THREE.MeshBasicMaterial( { color: 0xececec	, wireframe:false, transparent: false, side:1} );
var basicGreyMaterial = new THREE.MeshBasicMaterial( { color: 0x707090, wireframe:false, transparent: false , side: 1} ); 

var tubeMesh = new THREE.Mesh(tube,tubeMat);

var BgPlate=(function(){
	var bgPlates = new THREE.Geometry();
	var PlateGeom = new THREE.PlaneGeometry(10,10);
	// var PlateGeom = new THREE.TorusGeometry(6,1,2,4);
	var color = 0xb0d0df;
	var color = 0x70c0d0;

	pivotRotate = new THREE.Object3D();
	pivotPosition = new THREE.Object3D();
	meshPivot = new THREE.Object3D();

	pivotRotate.add(meshPivot);
	pivotPosition.add(pivotRotate);
	var Material = new THREE.MeshBasicMaterial( { color: color, wireframe:false, transparent: false, opacity:0.5,side: THREE.FrontSide} );
	// var Wireframe = new THREE.MeshBasicMaterial( { color: 0xa0b0c0, wireframe:true, wireframeLinewidth:1 ,side: THREE.Front} );
	var BackMaterial = new THREE.MeshBasicMaterial( { color: color, wireframe:false, transparent: true , opacity: 0.3 ,side: THREE.BackSide} );
	function BgPlate (position) {
		this.height = 3;
		this.heightDelta = 3;
		this.heightDelta2 = this.heightDelta/2;
		this.position = position || 0;
		this.calculatedPosition = spline.getPointAt(this.position/level.length);
		this.calculatedDirection = spline.getTangentAt(this.position/level.length);
		this.radius = tubeRadius*1.2;
		//this.geometry = new THREE.PlaneGeometry(10,20);
		this.init();
	}
	BgPlate.prototype.init = function(){
		meshPivot.position.y = -this.radius;
		// meshPivot.position.y = -this.radius+this.height + Math.random()*this.heightDelta-this.heightDelta2;
		meshPivot.rotation.x = -90*TO_RADIANS;
		// meshPivot.rotation.z = 45*TO_RADIANS;
		pivotRotate.scale.set(1,1,1.5);
		pivotPosition.up = vectorUp;
		pivotPosition.position = this.calculatedPosition;
		pivotRotate.rotation.z = Math.random()*Math.PI*2;
		pivotPosition.lookAt(this.calculatedPosition.clone().add(this.calculatedDirection));
		
		pivotPosition.updateMatrixWorld();
		// var parent
		// scene.add(this.pivotPosition);
		// scene.updateMatrixWorld();
		// this.meshPivot.updateMatrixWorld();
		// scene.remove(this.pivotPosition);
		// this.mesh = new THREE.Mesh(this.geometry,Wireframe);
		bgPlates.merge(PlateGeom,meshPivot.matrixWorld);
		
	};

	// BgPlate.prototype.mesh = THREE.SceneUtils.createMultiMaterialObject( bgPlates, [Material,BackMaterial]);
	BgPlate.prototype.mesh = new THREE.Mesh( bgPlates, Material);
	return BgPlate;
})();

var BgWall=(function(){
	var bgWalls = new THREE.Geometry();

	var pivotRotate = new THREE.Object3D();
	var pivotPosition = new THREE.Object3D();
	var pivotMesh = new THREE.Object3D();
	pivotRotate.add(pivotMesh);
	pivotPosition.add(pivotRotate);

	var WallGeom = new THREE.BoxGeometry(1,1,1);
	// var Material = new THREE.MeshBasicMaterial( { color: 0xf0f0f0} );;
	var Material = tubeMat//new THREE.MeshBasicMaterial( { color: 0xf0f0f0} );;
	var Wireframe = new THREE.MeshBasicMaterial( { color: 0xa0b0c0, wireframe:true, wireframeLinewidth:1 ,side: THREE.Front} );
	function BgWall (position,angle,height) {
		// this.heightDelta = 3;
		// this.heightDelta2 = this.heightDelta/2;
		this.angle = angle*TO_RADIANS||0;
		this.height = height*tubeRadius*(outerTubeRadiusCoeff-1)||0;//Math.random()*tubeRadius*(outerTubeRadiusCoeff-1);;
		this.position = position || 0;
		this.calculatedPosition = spline.getPointAt(this.position/level.length);
		this.calculatedDirection = spline.getTangentAt(this.position/level.length);
		// this.radius = tubeRadius*1.1;
		// this.geometry = new THREE.BoxGeometry(20,200,this.height);
		// this.mesh = new THREE.Mesh(this.geometry,Wireframe);
		// this.meshPivot = new THREE.Object3D();
		this.init();
	}
	BgWall.prototype.init = function(){
		pivotMesh.position.y = tubeRadius*outerTubeRadiusCoeff - this.height/2;
		pivotMesh.rotation.x = -90*TO_RADIANS;
		pivotMesh.scale.set(10,20,this.height);
		// this.mesh.scale.set(20,20,this.height);
		pivotPosition.up = vectorUp;
		pivotPosition.position = this.calculatedPosition;
		pivotRotate.rotation.z = this.angle;
		pivotPosition.lookAt(this.calculatedPosition.clone().add(this.calculatedDirection));
		pivotPosition.updateMatrixWorld();
		// scene.add(this.pivotPosition);
		// scene.updateMatrixWorld();
		// scene.remove(this.pivotPosition);
		bgWalls.merge(WallGeom,pivotMesh.matrixWorld);
		// scene.add(BgWall.mesh);
	};
	BgWall.prototype.mesh = THREE.SceneUtils.createMultiMaterialObject( bgWalls, [Material]);
	return BgWall;
})();
