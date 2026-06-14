var gameCam = new GameCamera();
var mainCamera = gameCam.camera;

var colorHSLMain = {h: 0.6142857142857142, s: 0.5, l: 0.503921568627451};
var colorHSL = {h: 0.6142857142857142, s: 0.5, l: 0.503921568627451};
scene.fog = new THREE.Fog( 0x0aac0f0, -150, 1150 ); //normal
scene.fog.color.setHSL(colorHSLMain.h,colorHSLMain.s,colorHSLMain.l);

var SCORE = 0;
var tmpRot = 0;
var tmpRotB = 0;
var tmpRotC = 0;

var sequenceVar = 0;
inv = 1;
var lastBeatTime = 0;

function loadBeats(){
	for (var i = 0; i < beats.length; i++) {
		var beat = beats[i];
		beat.a = beat.a-150;
		// var pos = level.length/duration*(beat.a-50);
		var pos = level.length/duration*beat.a;

		// Pre-roll: beats falling in the first 150ms get a negative position
		// after the -150ms offset. Spline.getPointAt(negative) → NaN cascade →
		// undefined index. Skip them; the tube is a closed spline but the
		// arclength→t mapping is not wrap-aware.
		if (pos < 0) continue;


		if(Math.random()>0.7){
			inv *= -1;
			tmpRotB = (Math.random()*90+25)*inv;
		}

		if(Math.random()<sequenceVar*0.01){
			tmpRotC = Math.floor(Math.random()*3%3)*120;
			sequenceVar =0;
		}

		if(beat.b == 2){
			inv *= -1;
			tmpRotB = (Math.random()*90+25)*inv;
			var spd = (Math.random()*90+90)*inv;
			new Obstacles.RotateObstacle({
				position:pos,
				startRotation:(tmpRot+180)%(360),
				type:beat.b,
				speed: spd,
				timestamp:beat.a,
			}).update();

			new Obstacles.RotateObstacle({
				position:pos,
				startRotation:(tmpRot+180+120)%(360),
				type:beat.b,
				speed: spd,
				timestamp:beat.a,
			}).update();

			new Obstacles.RotateObstacle({
				position:pos,
				startRotation:(tmpRot+180+240)%(360),
				type:beat.b,
				speed: spd,
				timestamp:beat.a,
			}).update();
		} else {	
			sequenceVar++;
			new Obstacles.Coin({
				position:pos,
				speed: spd,
				startRotation:(tmpRot%360 + tmpRotC),
				timestamp:beat.a,
				big:true
			}).update();

			new Obstacles.Coin({
				position:pos,
				speed: spd,
				startRotation:(tmpRot+120 + tmpRotC)%360,
				timestamp:beat.a,
				big:false
			}).update();


			new Obstacles.Coin({
				position:pos,
				speed: spd,
				startRotation:(tmpRot+240 + tmpRotC)%360,
				timestamp:beat.a,
				big:false
			}).update();

		}
		
		tmpRot += tmpRotB*((beat.a-lastBeatTime)/1000);

		// if(Math.random()>0.6){
		// }
		lastBeatTime = beat.a;
		// console.log(pos);
	};
	Obstacles.prepare();
}


function addPlates(){
	// var num = level.length/17;
	var num = level.length/17;
	console.time('creating plates');

	for (var i = 0; i < num; i++) {
		var pos = level.length/num*i;
		for (var j = 0; j < 4*Math.random(); j++) {
			new BgPlate(pos);
		};
	};	
	console.timeEnd('creating plates');
	scene.add(BgPlate.prototype.mesh);
}

function addWalls(){
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

loadBeats();
addPlates();
// addWalls();

var player = new Player();
scene.add(tubeMesh);



function render() {
	requestAnimationFrame(render);
	renderer.render(scene, mainCamera);
	mainloop();
}
MPlayer.play();





render();
