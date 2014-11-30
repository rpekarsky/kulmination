var tt;
var Game = function Game (params) {
	this.params = params;
	this.scene = new THREE.Scene();
	tt = this;
	// var lastX = width/2;
	// var lastXto = width/2;

	var colorHSLMain = {h: 0.6142857142857142, s: 0.5, l: 0.503921568627451};
	var colorHSL = {h: 0.6142857142857142, s: 0.5, l: 0.503921568627451};
	this.scene.fog = new THREE.Fog( 0x0aac0f0, -150, 1150 ); //normal
	this.scene.fog.color.setHSL(colorHSLMain.h,colorHSLMain.s,colorHSLMain.l);

	this.analyser = new Analyser(256);
	// this.analyser = new Analyser(32);

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
	this.futureTime = 0;
	MPlayer.init(this.params.path,this.futureTime,this.init.bind(this));
	

	// this.loadBeats();

	
}

Game.prototype={
	onAddBeat:function(time,type){
		// console.log('add beat',time);
		// return 0;

		// var timestamp = Math.max(time-this.analyser.lastTime-100,0);
		var timestamp = Math.max(time+100,0);
		var pos = (this.tube.length/this.duration)*timestamp; // TODO
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

		// if(type == 2){
		// 	this.inv *= -1;
		// 	this.tmpRotB = (Math.random()*90+25)*this.inv;
		// 	var spd = (Math.random()*90+90)*this.inv;
		// 	this.obstacles.createRotate({
		// 		position:pos,
		// 		startRotation:(this.tmpRot+180)%(360),
		// 		type:type,
		// 		speed: spd,
		// 		timestamp:timestamp,
		// 	});

		// 	this.obstacles.createRotate({
		// 		position:pos,
		// 		startRotation:(this.tmpRot+180+120)%(360),
		// 		type:type,
		// 		speed: spd,
		// 		timestamp:timestamp,
		// 	});

		// 	this.obstacles.createRotate({
		// 		position:pos,
		// 		startRotation:(this.tmpRot+180+240)%(360),
		// 		type:type,
		// 		speed: spd,
		// 		timestamp:timestamp,
		// 	});
		// } else {	
		// 	this.sequenceVar++;
			this.obstacles.createCoin({
				position:pos,
				// speed: spd,
				startRotation:(this.tmpRot%360 + this.tmpRotC),
				timestamp:timestamp,
				big:true
			})

			this.obstacles.createCoin({
				position:pos,
				// speed: spd,
				startRotation:(this.tmpRot+120 + this.tmpRotC)%360,
				timestamp:timestamp,
				big:false
			})


			this.obstacles.createCoin({
				position:pos,
				// speed: spd,
				startRotation:(this.tmpRot+240 + this.tmpRotC)%360,
				timestamp:timestamp,
				big:false
			})
		// }
		
		this.tmpRot += this.tmpRotB*((time-this.lastBeatTime)/1000);

		// if(Math.random()>0.6){
		// }
		this.lastBeatTime = timestamp;
		// console.log(pos);
	},
	mainloop:function(){
		this.time = Math.floor(MPlayer.getTime());//MPlayer.audioDelayed.currentTime*1000;
		this.timePosition = Math.max(this.time/this.duration,0);
		// this.analyser.onAnalyze();

		if(!this.closed){
			// this.analyser.onAnalyze();
			// this.readControls();
			// this.gameCam.update();
			// this.player.update();
			// this.obstacles.update();
			// Renderer.DOMinfo.textContent = this.analyser.lastTime;
			// if(this.obstacles.CoinPool && this.obstacles.RotatePool){
				var debugInfo = '';
				debugInfo += '\ntime:'+this.time;

				if(this.obstacles.CoinPool){
					debugInfo += '\npoolCoin:' + this.obstacles.CoinPool.length;
					debugInfo += '\ncountCoin:' + this.obstacles.Coin.prototype.count;
				}
				if(this.obstacles.RotatePool){
					debugInfo += '\npoolWall:' + this.obstacles.RotatePool.length;
					debugInfo += '\ncountWall:' + this.obstacles.RotateObstacle.prototype.count;
				}

				debugInfo += '\nanalize:' + this.analyser.lastTime 
				debugInfo += '\nobj update:'+this.obstacles.currentUpdateCount;
				// Renderer.DOMinfo.textContent = debugInfo;
			// }
			
			// if(this.musicPlayStarted){
				// this.render();
			// }
			// webkitRequestAnimationFrame(this.loop);
		} else {
			webkitCancelRequestAnimationFrame(this.loop);
			webkitCancelAnimationFrame(this.loop);
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
		this.closed = false;
		this.duration = Math.floor(MPlayer.duration*1000);
		console.log("INIT!");

		// this.analyserProcessor = new AnalyserProcessor({minfreq:Math.floor(this.analyser.barsCount*0.0),maxfreq:Math.floor(this.analyser.barsCount*1),analyser: this.analyser,drawer:new Drawer() });
		this.analyserProcessor = new AnalyserProcessor({minfreq:0,maxfreq:this.analyser.barsCount,analyser: this.analyser,drawer:new Drawer() });
		// this.analyserProcessor = new AnalyserProcessor({minfreq:Math.floor(1024*0.3),maxfreq:Math.floor(1024*0.7),analyser: this.analyser });

		this.analyserProcessor.callback = this.onAddBeat.bind(this);

		// this.analyser.input(MPlayer.source);
		// this.analyser.input(MPlayer.source);

		MPlayer.source.connect(this.analyser.analyser);
		// MPlayer.source.connect(this.analyser.scriptProc);
		// console.log(this.analyser.analyser,MPlayer.source);
	
		this.tube = new Tube(this);
		// this.tube.addPlates();
		this.obstacles = new Obstacles(this);
		this.gameCam = new GameCamera(this);
		this.player = new Player(this);
		this.scene.add(this.tube.mesh);

		Renderer.show();
		Controls.show();
		this.mainloop();
		GamePage.instance.ready();
		// MPlayer.play();
	},
	render:function() {
		Renderer.GL.render(this.scene, this.gameCam.camera);

		// console.log('render');
	},
	close:function(){
		Renderer.hide();
		Controls.hide();
		webkitCancelRequestAnimationFrame(this.loop);
		webkitCancelAnimationFrame(this.loop);
		this.closed = true;
		this.obstacles = null;
		this.player = null;
		this.gameCam = null;
		this.tube = null;
		MPlayer.source.disconnect(this.analyser.input);
		MPlayer.stop();
		this.analyser.destroy();
	}
}