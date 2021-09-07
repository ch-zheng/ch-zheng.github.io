'use strict';

//Globals
const ctx = document.getElementById('boids_canvas')
	.getContext('2d');
const boids = [];
const VELOCITY = 70;
//const ANGULAR_VELOCITY = 1;
const VIEW_RADIUS = 20;

//Populate boids
for (let i = 0; i < 400; i++) {
	const direction = randomInt(0, 2 * Math.PI)
	boids.push({
		x: randomInt(0, ctx.canvas.width),
		y: randomInt(0, ctx.canvas.height),
		dx: VELOCITY * Math.cos(direction),
		dy: VELOCITY * Math.sin(direction)
	});
}

//Frame updates
let previousTimestamp = performance.now();
function update(timestamp) {
	const delta = (timestamp - previousTimestamp) / 1000;
	previousTimestamp = timestamp;
	//Behavior
	for (const boid of boids) {
		//Get neighbors
		//TODO: Spacial partitioning method
		const neighbors = [];
		for (const other of boids) {
			if (other === boid) continue;
			/* Wrapping-conscious distance
			let x_distance = Math.min(
				Math.abs(boid.x - other.x),
				Math.abs(boid.x - other.x + ctx.canvas.width),
				Math.abs(boid.x - other.x - ctx.canvas.width)
			);
			let y_distance = Math.min(
				Math.abs(boid.y - other.y),
				Math.abs(boid.y - other.y + ctx.canvas.height),
				Math.abs(boid.y - other.y - ctx.canvas.height)
			);
			const distance = Math.hypot(x_distance, y_distance);
			*/
			const distance = Math.hypot(
				Math.abs(other.x - boid.x),
				Math.abs(other.y - boid.y)
			);
			if (distance < VIEW_RADIUS) {
				neighbors.push({
					x: other.x, y: other.y,
					/*x: boid.x - x_distance,
					y: boid.y - y_distance,*/
					dx: other.dx, dy: other.dy,
					distance: distance,
				});
			}
		}
		//Boidal urges
		let cohesion = {x: 0, y: 0};
		let separation = {x: 0, y: 0};
		let alignment = {x: 0, y: 0};
		if (neighbors.length) {
			for (const neighbor of neighbors) {
				cohesion.x += neighbor.x - boid.x;
				cohesion.y += neighbor.y - boid.y;
				separation.x -= (neighbor.x - boid.x) / neighbor.distance;
				separation.y -= (neighbor.y - boid.y) / neighbor.distance;
				alignment.x += neighbor.dx;
				alignment.y += neighbor.dy;
			}
			cohesion = normalize(cohesion);
			separation = normalize(separation, 1.02);
			alignment = normalize(alignment);
		}
		//Obstacle avoidance
		let collision = {x: 0, y: 0};
		if (boid.x - VIEW_RADIUS < 0) collision.x = 1;
		else if (boid.x + VIEW_RADIUS > ctx.canvas.width) collision.x = -1;
		if (boid.y - VIEW_RADIUS < 0) collision.y = 1;
		else if (boid.y + VIEW_RADIUS > ctx.canvas.height) collision.y = -1;
		collision = normalize(collision, 0.5);
		//TODO: Priority decisionmaking
		const result = normalize(add(
			cohesion,
			separation,
			alignment,
			collision
		), VELOCITY);
		boid.dx = result.x || boid.dx;
		boid.dy = result.y || boid.dy;
	}
	//Physics
	for (const boid of boids) {
		//Movement
		/* Polar coordinates
		boid.x += (VELOCITY * Math.cos(boid.direction)) * delta;
		boid.y += (VELOCITY * Math.sin(boid.direction)) * delta;
		*/
		boid.x += boid.dx * delta;
		boid.y += boid.dy * delta;
		//World boundary collisions
		if (boid.x < 0) boid.x = 0;
		else if (boid.x > ctx.canvas.width) boid.x = ctx.canvas.width;
		if (boid.x < 0) boid.y = 0;
		else if (boid.y > ctx.canvas.height) boid.y = ctx.canvas.height;
		/*
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
		*/
	}
	//Rendering
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	for (const boid of boids) {
		ctx.beginPath();
		const rotation = Math.atan2(boid.dy, boid.dx);
		ctx.ellipse(
			boid.x, boid.y,
			4, 2,
			rotation,
			0, 2 * Math.PI);
		ctx.fillStyle = HSLtoRGB((rotation * 180) / Math.PI + 180, 1.0, 0.6);
		ctx.fill();
	}
	window.requestAnimationFrame(update);
}
window.requestAnimationFrame(update);

function randomInt(min, max) {
	return Math.floor(min + Math.random() * (max - min));
}

function normalize(vector, multiplier = 1) {
	const magnitude = Math.hypot(vector.x, vector.y);
	if (!magnitude) return {x: 0, y: 0};
	return {
		x: (vector.x * multiplier) / magnitude,
		y: (vector.y * multiplier) / magnitude,
	};
}

function add(...vectors) {
	const result = {x: 0, y: 0};
	for (const vector of vectors) {
		result.x += vector.x;
		result.y += vector.y;
	}
	return result;
}

/* Uncomment in case of closed non-wrapping space
//k=2-d tree
function createTree(points) {
	//points = [...points.sort((a, b) => a.x > b.x)];
	points = [...shuffle(points)];
	const median = Math.floor(points.length / 2);
	const result = points[median];
	const axes = ['x', 'y'];
	//Insert points
	for (const point of points) {
		if (point === points[median]) continue;
		let current = result;
		let axis = 0;
		while (true) {
			const pointValue = point[axes[axis]];
			const currentValue = current[axes[axis]];
			axis = ++axis % axes.length;
			if (pointValue <= currentValue) {
				if (current.left) current = current.left;
				else {
					current.left = point;
					current.left.splitAxis = axes[axis];
					break;
				}
			} else {
				if (current.right) current = current.right;
				else {
					current.right = point;
					current.right.splitAxis = axes[axis];
					break;
				}
			}
		}
	}
	return result;
}

function findNeighbors(target, tree, radius) {
	const queue = [], result = [];
	queue.push(tree);
	while (queue.length) {
		const current = queue.shift();
		if (!current) continue;
		const axis = current.splitAxis;
		if (Math.hypot(current.x - target.x, current.y - target.y) <= radius)
			result.push(current);
		if (target[axis] <= current[axis]) {
			queue.push(current.left);
			if (Math.abs(current[axis] - target[axis]) <= radius)
				queue.push(current.right);
		} else {
			queue.push(current.right);
			if (Math.abs(current[axis] - target[axis]) <= radius)
				queue.push(current.left);
		}
	}
	return result;
}
*/

//Fisher-Yates Shuffle
function shuffle(list) {
	for (let i = list.length - 1; i >= 0; i--) {
		k = Math.floor(Math.random() * i);
		[list[i], list[k]] = [list[k], list[i]];
	}
}

function HSLtoRGB(H, S, L) {
	const C = (1 - Math.abs(2 * L - 1)) * S;
	H /= 60;
	const X = C * (1 - Math.abs(H % 2 - 1));
	let R, G, B;
	if (H < 1) [R, G, B] = [C, X, 0];
	else if (H < 2) [R, G, B] = [X, C, 0];
	else if (H < 3) [R, G, B] = [0, C, X];
	else if (H < 4) [R, G, B] = [0, X, C];
	else if (H < 5) [R, G, B] = [X, 0, C];
	else if (H < 6) [R, G, B] = [C, 0, X];
	else [R, G, B] = [0, 0, 0];
	const m = L - C / 2;
	[R, G, B] = [(R + m) * 255, (G + m) * 255, (B + m) * 255];
	//return {r: R, g: G, b: B};
	return '#'
		+ Math.round(R).toString(16).padStart(2, '0')
		+ Math.round(B).toString(16).padStart(2, '0')
		+ Math.round(G).toString(16).padStart(2, '0');
}
