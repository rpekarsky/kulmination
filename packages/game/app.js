
var APP = {
	currentState: undefined,
	init:function(){
		console.log('init');
    	Controls.init();
		Renderer.init();
		this.changeState(new MainMenu());
	},
	changeState:function(state){
		// console.log(state.text);
		if(this.currentState){
			this.currentState.hide();
		}
		this.currentState = state;
		this.currentState.show();
	}
}


document.onreadystatechange = function () {
    if (document.readyState == "complete") {
		APP.init();
   	}
}
