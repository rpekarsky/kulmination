var APP = {
	mainmenu:new MainMenu(),
	game: undefined,
	currentState: undefined,
	init:function(){
		this.changeState(this.mainmenu);
	},
	changeState:function(state){
		if(this.currentState){
			this.currentState.hide();
		}
		this.currentState = state;
		this.currentState.show();
	}
}

APP.init();