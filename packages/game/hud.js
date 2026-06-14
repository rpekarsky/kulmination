// HUD = single #game-hud container in index.html. One rotation applied to
// that container in loop.js tilts everything together like a tachometer
// overlay. No CSS3D anymore — flat HTML, CSS handles responsive layout.

var HudScore = (function () {
	function HudScore(){
		this.dom = document.getElementById('hud-score');
		this.scale = 1;
		this.dom.textContent = '0';
	}
	HudScore.prototype.setScore = function(score){
		this.dom.textContent = score;
		this.scale += 0.5;
	};
	HudScore.prototype.update = function(){
		this.scale += (1 - this.scale) * 0.1;
		this.dom.style.transform = 'scale(' + this.scale + ')';
	};
	return HudScore;
})();

var HudMultipler = (function () {
	function HudMultipler(){
		this.dom = document.getElementById('hud-multiplier');
		this.scale      = 1;
		this.baseScale  = 1;
		this.multiplier = 1;
		this.dom.textContent = 'x1';
	}
	HudMultipler.prototype.setMultiplier = function(m){
		this.multiplier = m;
		this.dom.textContent = 'x' + m;
		this.baseScale = 1 + Math.min(Math.max(m - 1, 0), 3) * 0.10;
	};
	HudMultipler.prototype.bump = function(){
		this.scale = this.baseScale + 0.9;
	};
	HudMultipler.prototype.update = function(){
		this.scale += (this.baseScale - this.scale) * 0.1;
		this.dom.style.transform = 'scale(' + this.scale + ')';
	};
	return HudMultipler;
})();

var HudStreak = (function () {
	function HudStreak(){
		this.dom = document.getElementById('hud-streak');
		this.scale = 1;
		this.dom.textContent = '0';
	}
	HudStreak.prototype.set = function(streak){
		this.dom.textContent = streak;
		this.scale += 0.5;
	};
	HudStreak.prototype.update = function(){
		this.scale += (1 - this.scale) * 0.1;
		this.dom.style.transform = 'scale(' + this.scale + ')';
	};
	return HudStreak;
})();

var HudBest = (function () {
	function HudBest(){
		this.dom = document.getElementById('hud-best');
		this.dom.textContent = '';
	}
	HudBest.prototype.setBest = function(n){
		this.dom.textContent = n ? ('BEST ' + n) : '';
	};
	HudBest.prototype.update = function(){};
	return HudBest;
})();

var scoreHud     = new HudScore();
var multiplerHud = new HudMultipler();
var streakHud    = new HudStreak();
var bestHud      = new HudBest();
