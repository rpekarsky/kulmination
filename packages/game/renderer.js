
var renderer = new THREE.WebGLRenderer( { antialias: false } );
var downscale = 2;
var width = window.innerWidth;
var height = window.innerHeight;
var bgColor = 0xa0a0a0
renderer.setSize( width/downscale, height/downscale );
document.body.appendChild( renderer.domElement );