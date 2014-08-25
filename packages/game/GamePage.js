GamePage = (function(){
	function GamePage(params){
		if ( GamePage.prototype._singletonInstance ) {
			GamePage.prototype._singletonInstance.init(params);
			return GamePage.prototype._singletonInstance;
		}
		GamePage.prototype._singletonInstance = this;

		this.text = 'GamePage';
		this.DOM = document.createElement('div');
		this.header = document.createElement('h2');
		
		this.back = document.createElement('button');
		this.back.textContent = 'back';
		this.back.onclick = APP.changeState.bind(APP,new MainMenu());
		this.DOM.appendChild(this.header);
		this.DOM.appendChild(this.back);
		this.init(params);
	}
	GamePage.prototype = {
		init:function(params){
			MPlayer.init(params);
			this.DOM.className = 'page GamePage';
			this.header.textContent = params;
			console.log(this.name);
			return this;
		},
		show:function(){
			document.body.appendChild(this.DOM);
			MPlayer.play();
		},
		hide:function(){
			MPlayer.stop();
			this.DOM.remove();
			console.log('hided!');
		}
	}
	return GamePage;
})();