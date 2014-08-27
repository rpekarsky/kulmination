Tube = (function Tube(){

			var color = 0x70c0d0;
	var Material = new THREE.MeshBasicMaterial( { color: color, wireframe:false, transparent: false, opacity:0.5,side: THREE.FrontSide} );
	function Tube(game){
		this.game = game;
		this.bgPlates = new THREE.Geometry();
		this.radius = 30;
		this.outerTubeRadiusCoeff = 2.5;
		var splinePoints = [];
		var splineRadius = this.game.duration/(Math.PI*2)*0.4;
		var points = Math.floor(this.game.duration/1000/2);
		for (var i = 0; i < points; i++) {
			splinePoints.push(
				new THREE.Vector4(
					Math.sin(Math.PI*2*i/points)*splineRadius,
					Math.cos(Math.PI*2*i/points)*splineRadius,
					(Math.random()*2-1)*splineRadius/160,
					this.radius*this.outerTubeRadiusCoeff));
		};
		var spline = new THREE.ClosedSplineCurve4(splinePoints);
		this.spline = spline;
		this.length = spline.getLength();

		var tubeGeom = new THREE.TubeGeometry(spline,Math.floor(this.length/128), 16, true, false);
		var tubeMaterial = new THREE.MeshBasicMaterial( { color: 0xececec	, wireframe:false, transparent: false, side:1} );
		this.mesh = new THREE.Mesh(tubeGeom,tubeMaterial);
		
	}
	Tube.prototype={
		BgPlate:(function(){
			var PlateGeom = new THREE.PlaneGeometry(10,10);
			// var PlateGeom = new THREE.TorusGeometry(6,1,2,4);
			// var color = 0xb0d0df;

			pivotRotate = new THREE.Object3D();
			pivotPosition = new THREE.Object3D();
			meshPivot = new THREE.Object3D();

			pivotRotate.add(meshPivot);
			pivotPosition.add(pivotRotate);
			
			// var Wireframe = new THREE.MeshBasicMaterial( { color: 0xa0b0c0, wireframe:true, wireframeLinewidth:1 ,side: THREE.Front} );
			var BackMaterial = new THREE.MeshBasicMaterial( { color: color, wireframe:false, transparent: true , opacity: 0.3 ,side: THREE.BackSide} );
			function BgPlate (position,game) {
				this.game = game;
				this.height = 3;
				this.heightDelta = 3;
				this.heightDelta2 = this.heightDelta/2;
				this.position = position || 0;
				this.calculatedPosition = this.game.tube.spline.getPointAt(this.position/this.game.tube.length);
				this.calculatedDirection = this.game.tube.spline.getTangentAt(this.position/this.game.tube.length);
				this.radius = this.game.tube.radius*1.2;
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
				this.game.tube.bgPlates.merge(PlateGeom,meshPivot.matrixWorld);
				
			};

			// BgPlate.prototype.mesh = THREE.SceneUtils.createMultiMaterialObject( bgPlates, [Material,BackMaterial]);
			
			return BgPlate;
		})(),
		BgWall:(function(){
			var bgWalls = new THREE.Geometry();

			var pivotRotate = new THREE.Object3D();
			var pivotPosition = new THREE.Object3D();
			var pivotMesh = new THREE.Object3D();
			pivotRotate.add(pivotMesh);
			pivotPosition.add(pivotRotate);

			var WallGeom = new THREE.BoxGeometry(1,1,1);
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
			// BgWall.prototype.mesh = THREE.SceneUtils.createMultiMaterialObject( bgWalls, [Material]);
			return BgWall;
		})(),
		addPlates:function addPlates(){
			console.time('creating plates');
			var num = this.length/17;
			for (var i = 0; i < num; i++) {
				var pos = this.length/num*i;
				for (var j = 0; j < 4*Math.random(); j++) {
					new this.BgPlate(pos,this.game);
				};
			};	
			var bgPlatesMesh = new THREE.Mesh(this.bgPlates,Material);
			this.game.scene.add(bgPlatesMesh);
			console.timeEnd('creating plates');
		},
		addWalls:function addWalls(){
			console.time('creating walls');
			var num = level.length/100;
			for (var i = 0; i < num; i++) {
				var jMax = 40;
				var pos = level.length/num*i;	
				for (var j = 0; j < jMax; j++) {
					var height = Math.random()*0.5+0.3;
					var chance = (Math.ceil(Math.random()*100));
					// if(chance%30 == 1){
					// 	var height = Math.random()*0.2+0.2;
					// }
					// if(chance%20 == 1){
					// 	var height = Math.random()*0.7+0.3;
					// }
					// if(chance%10 == 1){
					// 	var height = Math.random()*0.4+0.6;
					// }

					if(chance%8 == 1){
						var height = Math.random()*0.6+0.4;
					}
					// height = 1;
					// height*=Math.abs(Math.sin(pos/2));
					new BgWall(pos,360*j/jMax + i*360/10*0.5,height);
				};
			};
			console.timeEnd('creating walls');
			scene.add(BgWall.prototype.mesh);

		}

	}
	return Tube;
})()
