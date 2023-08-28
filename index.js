'use strict';
const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl2');

//Vertex shader source
const vertexShaderSource = `#version 300 es
	in vec2 pos;
	out vec2 coord;
	void main() {
		coord = pos;
		gl_Position = vec4(pos, 0, 1);
	}
`;

//Fragment shader source
const fragmentShaderSource = `#version 300 es
	precision mediump float;
	in vec2 coord;
	out vec4 color;
	uniform float time;
	float amps[] = float[](0.3, 0.2, 0.3);
	float freqs[] = float[](0.8, 1.0, 1.0);
	float vels[] = float[](0.2, 0.5, 0.5);
	vec2 dirs[] = vec2[](vec2(-1, 0), vec2(0, -1), vec2(1.414, 1.414));
	vec3 wave(
		const float a, //Amplitude
		const float f, //Frequency
		const float v, //Velocity
		const vec2 dir, //Direction
		const vec2 pos, //Position
		const float t //Time
	) {
		const float pi = 3.14159;
		float z = a * sin(2.0 * pi * f * (dot(dir, pos) + v * t));
		float dx = a * cos(2.0 * pi * f * (dot(dir, pos) + v * t)) * (2.0 * pi * f * dir.x);
		float dy = a * cos(2.0 * pi * f * (dot(dir, pos) + v * t)) * (2.0 * pi * f * dir.y);
		return vec3(dx, dy, z);
	}
	void main() {
		float height = 0.0;
		float dx = 0.0;
		float dy = 0.0;
		for (int i = 0; i < 3; ++i) {
			vec3 w = wave(amps[i], freqs[i], vels[i], dirs[i], coord, time);
			dx += w.x;
			dy += w.y;
			height += w.z;
		}
		vec3 n = normalize(vec3(-dx, -dy, 1));
		float shade = dot(n, vec3(0, 0, 1));
		//float shade = (height + 1.0) / 2.0;
		color = vec4(0, shade / 2.0, shade, 1);
	}
`;

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
