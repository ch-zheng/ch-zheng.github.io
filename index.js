'use strict';

const renderer = new THREE.WebGLRenderer({
	canvas: document.getElementById('render_canvas'),
	antialias: true
});

//Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera();
camera.position.z = 7;
camera.position.y = 8;
//camera.lookAt(0, 0, 0);

//Meshes
const material = new THREE.MeshPhongMaterial();
//Artifact
const box = new THREE.DodecahedronGeometry();
const artifact = new THREE.Mesh(box, material);
artifact.position.z = -4;
scene.add(artifact);
//Terrain
const terrainGeo = create_terrain(8);
const terrain = new THREE.Mesh(terrainGeo, material);
scene.add(terrain);
//Water
const plane = new THREE.PlaneGeometry(17, 17);
const waterMat = new THREE.MeshPhongMaterial({
	color: 0x64B5F6,
	opacity: 0.6,
	transparent: true
});
const water = new THREE.Mesh(plane, waterMat);
water.position.y = -0.2;
water.rotateX(-Math.PI / 2);
scene.add(water);
//Test
/*
const testGeo = new THREE.BufferGeometry();
const testVerts = new Float32Array([
	0, 0, 0,
	4, 0, 0,
	0, 4, 0
]);
const testNorms = new Float32Array([
	0, 0, 1,
	0, 0, 1,
	0, 0, 1
]);
testGeo.setAttribute('position', new THREE.BufferAttribute(testVerts, 3));
testGeo.setAttribute('normal', new THREE.BufferAttribute(testNorms, 3));
const testMesh = new THREE.Mesh(testGeo, material);
scene.add(testMesh);
*/

//Lighting
const sunlight = new THREE.DirectionalLight(0xFFFFFF, 0.5);
scene.add(sunlight);
const ambient = new THREE.AmbientLight(0xFFFFFF, 0.2);
scene.add(ambient);
const viewLight = new THREE.PointLight(0xFFFFFF, 0.5);
viewLight.position.set(camera.position.x, camera.position.y, camera.position.z);
scene.add(viewLight);

//Main loop
let t = 0;
let previousTimestamp = performance.now();
function update(timestamp) {
	const delta = (timestamp - previousTimestamp) / 1000;
	previousTimestamp = timestamp;
	//Frame updates
	t += 2 * delta;
	t %= 2 * Math.PI;
	//artifact.position.y = 2 * Math.sin(t);
	//Camera shake
	camera.rotation.x = 0.01 * Math.sin(t) - 1;
	camera.rotation.y = 0.002 * Math.sin(2*t);
	renderer.render(scene, camera);
	window.requestAnimationFrame(update);
}
window.requestAnimationFrame(update);

function create_terrain(radius) {
	//Construct triangles from heightmap
	const vertices = new Float32Array(18 * Math.pow(2 * radius, 2));
	const heightmap = create_heightmap(radius);
	let k = 0;
	for (let i = 0; i < 2 * radius; ++i) {
		for (let j = 0; j < 2 * radius; ++j) {
			/* Heightmap vertex layout
				(i, j) (i+1, j)
				(i, j+1) (i+1, j+1)
			*/
			vertices.set([
				//Upper-right triangle
				i, heightmap[i][j], j,
				i+1, heightmap[i+1][j+1], j+1,
				i+1, heightmap[i+1][j], j,
				//Lower-left triangle
				i, heightmap[i][j], j,
				i, heightmap[i][j+1], j+1,
				i+1, heightmap[i+1][j+1], j+1
			], k);
			k += 18;
		}
	}
	//Write to buffer
	const result = new THREE.BufferGeometry();
	result.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
	result.computeBoundingBox();
	result.center();
	result.computeVertexNormals();
	result.normalizeNormals();
	return result;
}

function create_heightmap(radius) {
	const length = 2 * radius + 1;
	const result = [];
	for (let i = 0; i < length; ++i) {
		const column = new Float32Array(length);
		for (let j = 0; j < length; ++j)
			column[j] = 2 *Math.random() - 1;
		result[i] = column;
	}
	return result;
}

//3x3 cross product
function cross(a, b) {
	return [
		a[1]*b[2] - a[2]*b[1],
		a[2]*b[0] - a[0]*b[2],
		a[0]*b[1] - a[1]*b[0]
	];
}
