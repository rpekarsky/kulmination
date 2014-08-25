var Canvas = (function(){
	function Canvas(w,h,z){
		this.dom = document.createElement('canvas');
		this.context = this.dom.getContext('2d');
		this.registered = [];
		this.init(w,h,z);
	}
	var p = Canvas.prototype;
	p.getAC = function(n){
			return Math.floor(n)*this.zoom;
	}
	p.getACC = function(n){
			return Math.floor(n)*this.zoom+this.zoom/2;
	}
	p.clear = function(){
		this.fill('#554530');
	}
	p.init = function(w,h,z) {
		this.zoom = z||6;
		this.width = w||110;
		this.height = h||60;
		this.dom.width = this.getAC(this.width);
		this.dom.height = this.getAC(this.height);
		document.body.appendChild(this.dom);
		// setInterval(this.redraw.bind(this),20);
	};
	p.fill = function(color){
		var buf = this.context.fillStyle;
		this.context.fillStyle = color;
		this.context.fillRect(
			0,
			0,
			this.dom.width,
			this.dom.height);
		this.context.fillStyle = buf;
	};
	p.drawPixel = function(x,y,color){
		var buf = this.context.fillStyle;
		this.context.fillStyle = color||'grey';
		this.context.fillRect(
			this.getAC(x),
			this.getAC(y),
			this.getAC(1),
			this.getAC(1));
		this.context.fillStyle = buf;	
	}

	p.drawLine = function(x1,y1,x2,y2,color){
		var buf = this.context.strokeStyle;
		// var buf2 = this.context.lineWidth
		this.context.lineWidth = this.zoom;
		this.context.strokeStyle = color||'#000000';
		this.context.beginPath();
		this.context.moveTo(this.getACC(x1),this.getACC(y1));
		this.context.lineTo(this.getACC(x2),this.getACC(y2));
		this.context.closePath();
		this.context.stroke();
		this.context.strokeStyle = buf;
	}

	p.drawPixelLine = function(x1,y1,x2,y2,color){
		var dx = x1 - x2;
		var dy = y1 - y2;
		var dxp = (dx>=0)?1:-1;
		var dyp = (dy>=0)?1:-1;
		for (var i = 0; i <= Math.abs(dx); i++) {
			var prog = Math.abs(i/dx);
			var progY = dy*prog;
			this.drawPixel(x1-i*dxp,y1-progY);
		};
		for (var i = 0; i <= Math.abs(dy); i++) {
			var prog = Math.abs(i/dy);
			var progX = dx*prog;
			this.drawPixel(x1-progX,y1-i*dyp);
		};
	}

	p.drawBoldPixelLine = function(x1,y1,x2,y2,color){
		this.drawPixelLine(x1,y1,x2,y2,color);

		this.drawPixelLine(x1+1,y1  ,x2+1,y2  ,color);
		this.drawPixelLine(x1  ,y1+1,x2  ,y2+1,color);
		this.drawPixelLine(x1+1,y1+1,x2+1,y2+1,color);

		this.drawPixelLine(x1-1,y1  ,x2-1,y2  ,color);
		this.drawPixelLine(x1  ,y1-1,x2  ,y2-1,color);
		this.drawPixelLine(x1-1,y1-1,x2-1,y2-1,color);

		this.drawPixelLine(x1-1,y1+1,x2-1,y2+1,color);
		this.drawPixelLine(x1+1,y1-1,x2+1,y2-1,color);
		
	}

	p.drawCircle = function(x,y,r,color){
		this.context.beginPath();
		var buf = this.context.strokeStyle;
		this.context.strokeStyle = color||'#000000';
		this.context.arc(
			this.getACC(x),
			this.getACC(y),
			this.getAC(r),0,360);
		this.context.closePath();
		this.context.stroke();
		this.context.strokeStyle = buf;
	}
	p.register = function(obj){
		var index = this.registered.indexOf(obj);
		if(index == -1){
			this.registered.push(obj);
		} else {
			this.registered.push(this.registered.splice(index,1)[0]);
		}
	}
	p.unregister = function(obj){
		var index = this.registered.indexOf(obj);
		if(index !== -1){
			this.registered.splice(index,1);
		}
	}
	p.redraw = function(){
		// this.clear();
		for (var i = 0; i < this.registered.length; i++) {
			this.registered[i].draw.call(this.registered[i],this);
		};
	}
	return Canvas;
})()