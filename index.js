'use strict';
const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl2');

//Vertex shader source
const vertResponse = await fetch('/water.vert');
const vertexShaderSource = await vertResponse.text();

//Fragment shader source
const fragResponse = await fetch('/water.frag');
const fragmentShaderSource = await fragResponse.text();

//Create shaders
const vertexShader = loadShader(gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS))
	console.log(gl.getProgramInfoLog(program));
gl.useProgram(program);

//Vertex buffer
const positions = new Float32Array([
	-1, -1,
	1, -1,
	-1, 1,
	1, 1
]);
const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW, 0, positions.length);

//Vertex attribute
const positionAttrib = gl.getAttribLocation(program, 'pos');
gl.vertexAttribPointer(positionAttrib, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(positionAttrib);

//Simulation
const uniformLocation = gl.getUniformLocation(program, 'time');
gl.enable(gl.CULL_FACE);
gl.enable(gl.SAMPLE_COVERAGE);
const start = performance.now();
requestAnimationFrame(update);

function update() {
	//Time
	const elapsed = performance.now() - start;
	const time = (elapsed / 1000) % 4096;
	gl.uniform1f(uniformLocation, time);
	//Draw
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	requestAnimationFrame(update);
}

function loadShader(type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.log(gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
	}
	return shader;
}
