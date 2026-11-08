import { toLinearRgb } from "./dither-color"
import { DITHER } from "./dither-config"
import { DITHER_FRAGMENT } from "./dither-pass-source"
import { link } from "./dither-program"
import { WAVE_FRAGMENT } from "./dither-wave-source"

export type DitherFrame = {
  // How far the waves have drifted, in seconds of travel along each axis.
  offset: [number, number]
  // How far the intro has come, from 0 to 1.
  intro: number
  // How far the change of scene has come, from 0 to 1, and the colours it goes between.
  wipe: number
  from: Float32Array
  to: Float32Array
  // A ripple's start in CSS pixels from the top left, and how far it has run, from 0 to 1 (1 when none).
  ripple: [number, number, number]
}

export type DitherRenderer = {
  resize: (width: number, height: number) => void
  draw: (frame: DitherFrame) => void
  destroy: () => void
}

const MODES = { bayer: 0, bayer4: 1, bayer2: 2, halftone: 3, lines: 4, crosshatch: 5, noise: 6, none: 7 }

// React Bits' Dither on a raw WebGL2 canvas, in two passes: the waves into a small texture, one
// texel per dither cell, then the dither of that texture to the canvas. Null without WebGL2, so
// the page keeps its plain background.
export function createDitherRenderer(canvas: HTMLCanvasElement): DitherRenderer | null {
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
    powerPreference: "low-power",
  })
  if (!gl) return null
  const wave = link(gl, WAVE_FRAGMENT)
  const dither = link(gl, DITHER_FRAGMENT)
  if (!wave || !dither) return null

  const buffer = gl.createBuffer()
  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

  const field = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, field)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  const framebuffer = gl.createFramebuffer()

  const backgroundColor = toLinearRgb(DITHER.backgroundColor)
  const ratio = DITHER.dpr
  const cell = Math.max(1, Math.round(DITHER.pixelSize * ratio))
  const view = { width: 1, height: 1, cols: 1, rows: 1 }

  return {
    resize(width, height) {
      view.width = width
      view.height = height
      // A fixed size, so while a resize waits to be redrawn the old picture is cropped or
      // left short rather than stretched.
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      canvas.width = Math.max(1, Math.round(width * ratio))
      canvas.height = Math.max(1, Math.round(height * ratio))
      view.cols = Math.max(1, Math.ceil(canvas.width / cell))
      view.rows = Math.max(1, Math.ceil(canvas.height / cell))
      gl.bindTexture(gl.TEXTURE_2D, field)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, view.cols, view.rows, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, field, 0)
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    },

    draw({ offset, intro, wipe, from, to, ripple }) {
      if (gl.isContextLost()) return
      gl.bindVertexArray(vao)
      const reach = 0.5 * Math.hypot(view.width / view.height, 1) + 0.45

      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
      gl.viewport(0, 0, view.cols, view.rows)
      gl.useProgram(wave.program)
      const w = wave.uniforms
      gl.uniform2f(w.uResolution, canvas.width / ratio, canvas.height / ratio)
      gl.uniform1f(w.uCell, cell / ratio)
      gl.uniform2f(w.uOffset, offset[0], offset[1])
      gl.uniform1f(w.uWipe, wipe)
      gl.uniform1f(w.uWaveSpeed, DITHER.waveSpeed)
      gl.uniform1f(w.uWaveFrequency, DITHER.waveFrequency)
      gl.uniform1f(w.uWaveAmplitude, DITHER.waveAmplitude)
      gl.uniform1f(w.uScale, DITHER.scale)
      gl.uniform1f(w.uContrast, DITHER.contrast)
      gl.uniform1f(w.uBrightness, DITHER.brightness)
      gl.uniform1f(w.uIntro, intro)
      gl.uniform1f(w.uReach, reach)
      // Into the waves' units: centred, y up, and x in heights.
      const aspect = view.width / view.height
      gl.uniform3f(w.uRipple, (ripple[0] / view.width - 0.5) * aspect, 0.5 - ripple[1] / view.height, ripple[2])
      gl.drawArrays(gl.TRIANGLES, 0, 3)

      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.useProgram(dither.program)
      const d = dither.uniforms
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, field)
      gl.uniform1i(d.uField, 0)
      gl.uniform2i(d.uFieldSize, view.cols, view.rows)
      gl.uniform1f(d.uCellDevice, cell)
      gl.uniform1i(d.uMode, MODES[DITHER.ditherMode])
      gl.uniform1f(d.uColorNum, DITHER.colorNum)
      gl.uniform3fv(d.uFrom, from)
      gl.uniform3fv(d.uTo, to)
      gl.uniform1f(d.uWipe, wipe)
      gl.uniform1f(d.uReach, reach)
      gl.uniform3fv(d.uBackground, backgroundColor)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    },

    destroy() {
      gl.deleteProgram(wave.program)
      gl.deleteProgram(dither.program)
      gl.deleteBuffer(buffer)
      gl.deleteVertexArray(vao)
      gl.deleteTexture(field)
      gl.deleteFramebuffer(framebuffer)
    },
  }
}
