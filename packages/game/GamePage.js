GamePage = (function(){
	function GamePage(params){
		if ( GamePage.prototype.instance ) {
			GamePage.prototype.instance.init(params);
			return GamePage.prototype.instance;
		}
		GamePage.prototype.instance = this;
		GamePage.instance = this;

		this.text = 'GamePage';
		this.DOM = document.createElement('div');
		this.header = document.createElement('h2');
		
		this.back = document.createElement('button');
		this.back.textContent = 'back';
		this.back.onclick = APP.changeState.bind(APP,new MainMenu());
		// this.back.onclick = this.back.ontouchstart
		this.DOM.appendChild(this.header);
		this.DOM.appendChild(this.back);
		this.init(params);
	}
	GamePage.prototype = {
		init:function(params){
			// MPlayer.init(params);
			this.DOM.className = 'page GamePage';
			this.header.textContent = params.path;
			this.back.style.display = 'none';
			// console.log(this.name);
			this.game = new Game(params);
			return this;
		},
		ready:function(){
			this.back.style.display = 'inline-block';
		},
		show:function(){
			console.log("SHOW!");
			document.body.appendChild(this.DOM);
			// MPlayer.play();
		},
		hide:function(){
			this.game.close();
			// MPlayer.stop();
			// this.DOM.remove();
			this.DOM.parentNode.removeChild(this.DOM);
			console.log('hided!');
		}
	}
	return GamePage;
})();
