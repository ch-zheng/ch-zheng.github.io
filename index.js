'use strict';

//Globals
const ctx = document.getElementById('boids_canvas')
	.getContext('2d');
const boids = [];
const VELOCITY = 100;
//const ANGULAR_VELOCITY = 0.1;

//Populate boids
for (let i = 0; i < 2; i++) {
	boids.push({
		x: randomInt(0, ctx.canvas.width),
		y: randomInt(0, ctx.canvas.height),
		direction: randomInt(0, 2 * Math.PI)
	});
}

//Frame updates
let previousTimestamp = performance.now();
function update(timestamp) {
	const delta = (timestamp - previousTimestamp) / 1000;
	previousTimestamp = timestamp;
	//TODO: Behavior
	//Physics
	for (const boid of boids) {
		boid.x += (VELOCITY * Math.cos(boid.direction)) * delta;
		boid.y += (VELOCITY * Math.sin(boid.direction)) * delta;
		//x wrapping
		if (boid.x > ctx.canvas.width)
			boid.x %= ctx.canvas.width;
		else if (boid.x < 0)
			boid.x = ctx.canvas.width + boid.x;
		//y wrapping
		if (boid.y > ctx.canvas.height)
			boid.y %= ctx.canvas.height;
		else if (boid.y < 0)
			boid.y = ctx.canvas.height + boid.y;
	}
	//Rendering
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	for (const boid of boids) {
		ctx.beginPath();
		ctx.ellipse(boid.x, boid.y, 2, 2, 0, 0, 2*Math.PI);
		ctx.fill();
	}
	window.requestAnimationFrame(update);
}
window.requestAnimationFrame(update);

function randomInt(min, max) {
	return Math.floor(min + Math.random() * (max - min));
}
