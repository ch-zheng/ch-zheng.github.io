#version 300 es
in vec2 pos;
out vec2 coord;
void main() {
	coord = pos;
	gl_Position = vec4(pos, 0, 1);
}
