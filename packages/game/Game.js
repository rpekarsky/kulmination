var tt;
var Game = function Game (params) {
	this.params = params;
	this.scene = new THREE.Scene();
	tt = this;
	var lastX = width/2;
	var lastXto = width/2;

	var colorHSLMain = {h: 0.6142857142857142, s: 0.5, l: 0.503921568627451};
	var colorHSL = {h: 0.6142857142857142, s: 0.5, l: 0.503921568627451};
	this.scene.fog = new THREE.Fog( 0x0aac0f0, -150, 1150 ); //normal
	this.scene.fog.color.setHSL(colorHSLMain.h,colorHSLMain.s,colorHSLMain.l);

	this.analyser = new Analyser(2048);
	this.analyserProcessor = new AnalyserProcessor({minfreq:0,maxfreq:1024, analyser: this.analyser });
	this.analyserProcessor.callback = this.onAddBeat.bind(this);
	// var SCORE = 0;



	this.SCORE = 0;
	this.tmpRot = 0;
	this.tmpRotB = 0;
	this.tmpRotC = 0;

	this.sequenceVar = 0;
	this.inv = 1;
	this.lastBeatTime = 0;
	this.angle = 0;
	this.rotateDelta = 0;
	this.loop = this.mainloop.bind(this);

	this.lastX = 0.5;
	this.lastXto = 0.5;
	this.rotateDelta = 0;
	this.angle = 0;
	this.time = 0;
	this.musicPlayStarted = false;
	this.duration = 0;
	this.futureTime = 3;
	MPlayer.init(this.params.path,this.init.bind(this));
	MPlayer.source.connect(this.analyser.input);
	

	// this.loadBeats();

	// console.log(this.tube.addPlates());
}

Game.prototype={
	onAddBeat:function(time,type){
		// console.log('add beat',time);
		var pos = this.tube.length/this.duration*Math.max(time+50,0); // TODO
		// this.obstacles.createCoin({
		// 	position:pos,
		// 	speed: 0,
		// 	startRotation:0,
		// 	timestamp:time,
		// 	big:false
		// });

		if(Math.random()>0.7){
			this.inv *= -1;
			this.tmpRotB = (Math.random()*90+25)*this.inv;
		}

		if(Math.random()<this.sequenceVar*0.01){
			this.tmpRotC = Math.floor(Math.random()*3%3)*120;
			this.sequenceVar =0;
		}

		if(type == 2){
			this.inv *= -1;
			this.tmpRotB = (Math.random()*90+25)*this.inv;
			var spd = (Math.random()*90+90)*this.inv;
			this.obstacles.createRotate({
				position:pos,
				startRotation:(this.tmpRot+180)%(360),
				type:type,
				speed: spd,
				timestamp:time,
			});

			this.obstacles.createRotate({
				position:pos,
				startRotation:(this.tmpRot+180+120)%(360),
				type:type,
				speed: spd,
				timestamp:time,
			});

			this.obstacles.createRotate({
				position:pos,
				startRotation:(this.tmpRot+180+240)%(360),
				type:type,
				speed: spd,
				timestamp:time,
			});
		} else {	
			this.sequenceVar++;
			this.obstacles.createCoin({
				position:pos,
				speed: spd,
				startRotation:(this.tmpRot%360 + this.tmpRotC),
				timestamp:time,
				big:true
			})

			this.obstacles.createCoin({
				position:pos,
				speed: spd,
				startRotation:(this.tmpRot+120 + this.tmpRotC)%360,
				timestamp:time,
				big:false
			})


			this.obstacles.createCoin({
				position:pos,
				speed: spd,
				startRotation:(this.tmpRot+240 + this.tmpRotC)%360,
				timestamp:time,
				big:false
			})
		}
		
		this.tmpRot += this.tmpRotB*((time-this.lastBeatTime)/1000);

		// if(Math.random()>0.6){
		// }
		this.lastBeatTime = time;
		// console.log(pos);
	},
	loadBeats:function(){
		for (var i = 0; i < this.params.beats.length; i++) {
			var beat = this.params.beats[i];
			// console.log(beat);
			beat.a = Math.max(beat.a-150,0);
			
			// var pos = level.length/duration*(beat.a-50);
			var pos = this.tube.length/this.duration*beat.a;


			if(Math.random()>0.7){
				this.inv *= -1;
				this.tmpRotB = (Math.random()*90+25)*this.inv;
			}

			if(Math.random()<this.sequenceVar*0.01){
				this.tmpRotC = Math.floor(Math.random()*3%3)*120;
				this.sequenceVar =0;
			}

			if(beat.b == 2){
				this.inv *= -1;
				this.tmpRotB = (Math.random()*90+25)*this.inv;
				var spd = (Math.random()*90+90)*this.inv;
				this.obstacles.createRotate({
					position:pos,
					startRotation:(this.tmpRot+180)%(360),
					type:beat.b,
					speed: spd,
					timestamp:beat.a,
				});

				this.obstacles.createRotate({
					position:pos,
					startRotation:(this.tmpRot+180+120)%(360),
					type:beat.b,
					speed: spd,
					timestamp:beat.a,
				});

				this.obstacles.createRotate({
					position:pos,
					startRotation:(this.tmpRot+180+240)%(360),
					type:beat.b,
					speed: spd,
					timestamp:beat.a,
				});
			} else {	
				this.sequenceVar++;
				this.obstacles.createCoin({
					position:pos,
					speed: spd,
					startRotation:(this.tmpRot%360 + this.tmpRotC),
					timestamp:beat.a,
					big:true
				})

				this.obstacles.createCoin({
					position:pos,
					speed: spd,
					startRotation:(this.tmpRot+120 + this.tmpRotC)%360,
					timestamp:beat.a,
					big:false
				})


				this.obstacles.createCoin({
					position:pos,
					speed: spd,
					startRotation:(this.tmpRot+240 + this.tmpRotC)%360,
					timestamp:beat.a,
					big:false
				})

			}
			
			this.tmpRot += this.tmpRotB*((beat.a-this.lastBeatTime)/1000);

			// if(Math.random()>0.6){
			// }
			this.lastBeatTime = beat.a;
			// console.log(pos);
		};
		this.obstacles.prepare();
	},
	mainloop:function(){
		if(!this.musicPlayStarted && MPlayer.audio.currentTime>this.futureTime){
			// console.log(MPlayer.audio.currentTime);
			MPlayer.audioDelayed.play();
			this.musicPlayStarted = true;
		}
		this.time = MPlayer.audioDelayed.currentTime*1000;
		this.timePosition = this.time/this.duration || 0;

		// console.log(delayedTime,curLoopTime);
		// if(curLoopTime<0){
		// 	curLoopTime = 0;
		// }
		this.readControls();
		this.gameCam.update();
		this.player.update();
		this.obstacles.update();

		if(this.musicPlayStarted){
			this.render();
		}

		if(!this.closed){
			requestAnimationFrame(this.loop);
		} else {
			cancelAnimationFrame(this.loop);
		}
	},
	readControls:function(){
		if(Controls.leftPressed){
			this.lastXto = 0;
		}
		if(Controls.rightPressed){
			this.lastXto = 1;
		}
		if(Controls.leftPressed == false && Controls.rightPressed == false){
			this.lastXto = 0.5;
		}
		
		this.lastX += (this.lastXto - this.lastX)*0.05;
		this.rotateDelta = (0.5 - this.lastX);
		this.angle += this.rotateDelta*30;
	},
	init:function(){
		this.duration = Math.floor(MPlayer.audio.duration*1000);
		console.log("INIT!",this.duration);
		this.tube = new Tube(this);
		this.obstacles = new Obstacles(this);
		this.gameCam = new GameCamera(this);
		this.player = new Player(this);
		this.scene.add(this.tube.mesh);
		this.mainloop();
		MPlayer.play();
	},
	render:function() {
		renderer.render(this.scene, this.gameCam.camera);
	},
	close:function(){
		MPlayer.source.disconnect(this.analyser.input);
		MPlayer.stop();
		this.analyser.destroy();
		this.closed = true;
		this.obstacles = null;
		this.player = null;
		this.gameCam = null;
		this.tube = null;
	}
}