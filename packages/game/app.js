
var APP = {
	currentState: undefined,
	init:function(){
		console.log('init');
		this.changeState(new MainMenu());
	},
	changeState:function(state){
		console.log(state.text);
		if(this.currentState){
			this.currentState.hide();
		}
		this.currentState = state;
		this.currentState.show();
	}
}

APP.init();
