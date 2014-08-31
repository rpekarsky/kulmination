MainMenu = (function(){
	function MainMenu(){
		if ( MainMenu.prototype._singletonInstance ) {
			return MainMenu.prototype._singletonInstance;
		}
		MainMenu.prototype._singletonInstance = this;

		this.text = 'MainMenu';
		this.DOM = document.createElement('div');

		this.header = document.createElement('h2');
		this.header.textContent = 'MAIN MENU';
		this.DOM.appendChild(this.header);
		for (var i = 0; i < Collection.length; i++) {
			var btn = document.createElement('button');
			btn.textContent = Collection[i].path;
			btn.obj = Collection[i];
			btn.onclick = function(){
				APP.changeState(new GamePage(this.obj));
			}
			// btn.onclick = btn.ontouchstart;
			this.DOM.appendChild(btn);
		};

		this.init();
	}
	MainMenu.prototype = {
		init:function(){
			this.DOM.className = 'page MainMenu';
			// APP.changeState(new GamePage(Collection[0]));
		},
		show:function(){
			document.body.appendChild(this.DOM);
		},
		hide:function(){

			this.DOM.parentNode.removeChild(this.DOM);
			console.log('MENU hided!');
		}
	}
	return MainMenu;
})();
