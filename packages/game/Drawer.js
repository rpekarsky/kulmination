var Drawer = (function(){
	var graphConfig = {
	  x:0,
	  y:50,
	  width:768/2,
	  height:60,
	}
	var speed = 1;
	var scaleConst = graphConfig.height/256;
	function Drawer(){
		this.DOM = document.createElement('canvas');
		this.DOM.style.zIndex = 1;
		this.DOM.style.position = 'fixed';
		this.ctx = this.DOM.getContext('2d');
		this.init();
	}
	Drawer.prototype.init = function() {
		// this.DOM.width = graphConfig.width;
		// this.DOM.height = graphConfig.height+100;

		this.DOM.width = 768/2;
		this.DOM.height = 768;
		this.OFFSET = 0;
		this.beat1Intense = 0;
		this.beat2Intense = 0;
		document.body.appendChild(this.DOM);
	};

	Drawer.prototype.drawBeat2 = function(analyser) {
	}

	Drawer.prototype.drawBeat1 = function(analyser) {
	}

	Drawer.prototype.drawFFT = function(analyser) {
		var obj = {
			x:0,
			y:0,
			height:100,
			width:768/2,
		}
		this.ctx.fillStyle = 'white';
		this.ctx.fillRect(
				obj.x,
				obj.y,
				obj.width,
				obj.height
			);
		var freq = analyser.freqData;
		var length = freq.length;
		// var intence = 0;
		for (var i = 0; i < freq.length; i++) {
			var f = freq[i];
			this.ctx.fillStyle = 'green';
			// intence = Math.floor(Math.sin((freq[i]/256)*(Math.PI/2))*256);
			// this.ctx.fillStyle = 'rgb('+intence+','+intence+','+intence+')';
			var str = f/256;
			this.ctx.fillRect(
				obj.x + i*obj.width/length,
				obj.y+obj.height-str*obj.height,
				obj.width/length,
				str*obj.height
			);
		};
	}

	Drawer.prototype.drawGraph = function(analyser) {
		
  		this.drawFFT(analyser);
  		return;
		// var clearColor = 'rgb(200,200,200)';	
		var clearColor = 'white';
		this.ctx.fillStyle = clearColor;
		this.ctx.fillRect(
			graphConfig.x + this.OFFSET,
			graphConfig.y,
			1,
			graphConfig.height+100
			);


		var clearColor = 'black';
		this.ctx.fillStyle = clearColor;
		this.ctx.fillRect(
			graphConfig.x,
			graphConfig.y+graphConfig.height,
			graphConfig.width,
			1
			);

		// this.ctx.fillStyle = 'black';
		// this.ctx.fillRect(
		// 	graphConfig.x + this.OFFSET+speed,
		// 	graphConfig.y,
		// 	speed,
		// 	graphConfig.height
		// 	);

		// this.ctx.fillStyle = 'gray';
		// this.ctx.fillRect(
		// 	graphConfig.x + this.OFFSET,
		// 	graphConfig.y+graphConfig.height-analyser.workingData,
		// 	speed,
		// 	analyser.workingData
		// 	);

		this.ctx.fillStyle = 'rgb(20,50,100)';
		this.ctx.fillRect(
			graphConfig.x + this.OFFSET,
			graphConfig.y+graphConfig.height-analyser.SmoothingRes*scaleConst,
			speed,
			analyser.SmoothingRes*scaleConst
			);

		
		// this.ctx.fillStyle = 'rgb(200,0,0)';
		// this.ctx.fillRect(
		// 	graphConfig.x + this.OFFSET -speed,
		// 	graphConfig.y+graphConfig.height-analyser.AvrVHystoryRes*scaleConst,
		// 	speed,
		// 	2//analyser.AvrVHystoryRes*scaleConst+2
		// 	);	

		// this.ctx.fillStyle = 'rgb(0,200,200)';
		// this.ctx.fillRect(
		// 	graphConfig.x + this.OFFSET -speed,
		// 	graphConfig.y+graphConfig.height-analyser.AvrHystorySplashRes*scaleConst,
		// 	speed,
		// 	2//analyser.AvrHystorySplashRes*scaleConst
		// 	);


		this.ctx.fillStyle = 'rgb(200,0,0)';
		this.ctx.fillRect(
			graphConfig.x + this.OFFSET,
			graphConfig.y+graphConfig.height-analyser.velocityTreshold*scaleConst-2,
			speed,
			2
		);





		// this.ctx.fillStyle = 'rgb(0,0,0)';
		// if(analyser.isBeat){
		// 	this.ctx.fillStyle = 'lime';
		// }
		// this.ctx.fillRect(
		// 	graphConfig.x + this.OFFSET,
		// 	graphConfig.y+graphConfig.height-analyser.BeatEnergyRes*10,
		// 	speed,
		// 	analyser.BeatEnergyRes*10
		// );



		// this.ctx.fillStyle = 'rgb(0,0,200)';
		// // if(analyser.isBeat){
		// // 	this.ctx.fillStyle = 'lime';
		// // }
		// this.ctx.fillRect(
		// 	graphConfig.x + this.OFFSET,
		// 	graphConfig.y+graphConfig.height-analyser.velocityScaled*scaleConst,
		// 	speed,
		// 	analyser.velocityScaled*scaleConst
		// );

		
		// this.ctx.fillStyle = 'rgb(0,200,0)';
		// // if(analyser.isBeat){
		// // 	this.ctx.fillStyle = 'lime';
		// // }
		// this.ctx.fillRect(
		// 	graphConfig.x + this.OFFSET,
		// 	graphConfig.y+graphConfig.height-analyser.bigVelocityScaled*scaleConst,
		// 	speed,
		// 	analyser.bigVelocityScaled*scaleConst
		// );



		this.OFFSET+=speed;
		if(this.OFFSET > this.DOM.width){
			this.OFFSET = 0;
		}

	}
	// Drawer.prototype.drawFFT = function(analyser) {
	// 	for (var i = 0; i < analyser.freqData; i++) {
	// 		var frec = analyser.freqData[i];
	// 	};
	// }

	Drawer.prototype.draw = function(analyser) {



  		this.drawGraph(analyser);
  		return;
		this.ctx.fillStyle = 'black';
		if(analyser.isBeat1 || analyser.isBeat2){
			this.ctx.fillRect(
				graphConfig.x + this.OFFSET-speed*3,
				graphConfig.y,
				speed*3,
				graphConfig.height
			);
		}

		if(analyser.isBeat1){
			this.ctx.fillStyle = 'rgb(255,0,0)';
			this.ctx.fillRect(
				graphConfig.x + this.OFFSET-speed*2,
				graphConfig.y,
				speed*1,
				graphConfig.height
			);
			this.beat1Intense = 1;
		}

		if(analyser.isBeat2){
			this.ctx.fillStyle = 'rgb(255,255,0)';
			this.ctx.fillRect(
				graphConfig.x + this.OFFSET-speed*2,
				graphConfig.y,
				speed*1,
				graphConfig.height
			);
			this.beat2Intense = 1;
		}

		var intence = Math.floor(this.beat1Intense*255);
		this.ctx.fillStyle = 'rgb('+(255-intence)+','+(255-intence)+','+(255-intence)+')';
		this.ctx.fillRect(
			0,
			0,
			50,
			50
		);


		var intence = Math.floor(this.beat2Intense*255);
		
		this.ctx.fillStyle = 'rgb('+(255-intence)+','+(255-intence)+','+(255-intence)+')';
		// this.ctx.fillStyle = 'rgb('+intence+','+intence+',0)';
		this.ctx.fillRect(
			50,
			0,
			50,
			50
		);

		this.beat1Intense += (0-this.beat1Intense)*0.15;
		this.beat2Intense += (0-this.beat2Intense)*0.15;

		// this.drawFFT(analyser);
	};
	return Drawer;
})()

// var drawer = new Drawer();