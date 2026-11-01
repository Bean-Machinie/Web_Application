import { VERTEX_SOURCE } from "./dither-wave-source"

export type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> }

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader
  gl.deleteShader(shader)
  return null
}

// A program of the full-screen vertex shader and the given fragment shader, with the locations
// of all its uniforms by name. Null if either does not compile or the two do not link.
export function link(gl: WebGL2RenderingContext, fragmentSource: string): Program | null {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SOURCE)
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource)
  const program = gl.createProgram()
  if (!vertex || !fragment || !program) return null
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.bindAttribLocation(program, 0, "aPosition")
  gl.linkProgram(program)
  gl.deleteShader(vertex)
  gl.deleteShader(fragment)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program)
    return null
  }

  const uniforms: Record<string, WebGLUniformLocation | null> = {}
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
  for (let at = 0; at < count; at++) {
    const info = gl.getActiveUniform(program, at)
    if (info) uniforms[info.name.replace("[0]", "")] = gl.getUniformLocation(program, info.name)
  }
  return { program, uniforms }
}
