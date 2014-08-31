
Renderer = {
	GL:null,
	DOM:null,
	DOMinfo:document.createElement('pre'),
	hide:function hide () {
		this.DOM.style.display = 'none';
	},
	show:function show(){
		this.DOM.style.display = 'block';
	},
	init:function init(){
		this.DOMinfo.className='info';
		var downscale = 1;
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		var bgColor = 0xa0a0a0;
		
		this.GL = new THREE.WebGLRenderer( { antialias: false } );;
		this.GL.setSize( this.width/downscale, this.height/downscale );
		this.DOM = this.GL.domElement;
		this.hide();
		document.body.appendChild( this.DOM );
		document.body.appendChild( this.DOMinfo );
	}
}