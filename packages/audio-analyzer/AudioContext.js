var AC = (function(){
	var ac = window.AudioContext || window.webkitAudioContext;
	return new ac();
})();	