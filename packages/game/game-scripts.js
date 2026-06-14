// Single source of truth for boot-time script load order. Consumed by
// both index.html (via <script src="game-scripts.js"> → globalThis.GAME_SCRIPTS)
// and packages/game/build.js (via require() → module.exports) for the
// prod bundle. globalThis assignment survives esbuild's minify DCE
// (a bare `var` at top level gets eliminated as unused).
globalThis.GAME_SCRIPTS = [
	// Vendor (pre-bundle these were static <script> tags in index.html).
	'js/three.min.js',
	'js/dat.gui.min.js',
	'js/CurveExtras.js',

	// Our own pre-game helpers.
	'beat-detector.js',

	// Game core (legacy global-scope, order matters).
	'rng.js',
	'beat-filter.js',
	'search/search.js',
	'search/search-audius.js',
	'search/search-ui.js',
	'MPlayer.js',
	'GameObject.js', 'Vector4.js', 'SplineCurve4.js', 'TubeGeometry.js',
	'utils.js', 'gui.js', 'camera.js', 'player.js', 'obstacles.js', 'tube.js',
	'hud.js', 'scoring.js', 'SFX.js', 'main.js', 'loop.js', 'initialize.js',
];
if (typeof module !== 'undefined') module.exports = globalThis.GAME_SCRIPTS;
