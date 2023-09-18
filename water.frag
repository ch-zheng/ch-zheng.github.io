#version 300 es
precision mediump float;
in vec2 coord;
out vec4 color;
uniform float time;
const float PI = 3.14159;

/*
//Gerstner wave
vec3 wave(
	const float freq,
	const vec2 dir,
	const vec2 pos,
	const float time
) {
	float t = freq * dot(pos, dir) + time;
	float z = exp(sin(t) - 1.0);
	float dx = z * cos(t) * freq * dir.x;
	float dy = z * cos(t) * freq * dir.y;
	return vec3(dx, dy, z);
}
*/

//Sine wave
/*
vec3 wave(
	const float amp,
	const float freq,
	const vec2 dir,
	const vec2 pos,
	const float time
) {
	float t = freq * dot(pos, dir) + time;
	float z = amp * sin(t);
	float dx = amp * cos(t) * freq * dir.x;
	float dy = amp * cos(t) * freq * dir.y;
	return vec3(dx, dy, z);
}
*/

void main() {
	//vec3 surface = vec3(0);
	float height = 0.0;
	float amp = 1.0;
	float freq = 4.0;
	for (int i = 0; i < 8; ++i) {
		float angle = float(i);
		vec2 dir = vec2(cos(angle), sin(angle));
		height += amp * sin(freq * dot(coord, dir) + time);
		//surface += wave(amp, freq, dir, coord, time);
		amp *= 0.8;
		freq *= 1.2;
	}
	//vec3 n = normalize(vec3(-surface.x, -surface.y, 1));
	float x = floor(height + 4.0) / 8.0;
	color = vec4(0.1, x / 2.0, x, 1);
}
