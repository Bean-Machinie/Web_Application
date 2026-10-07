import type { Rgb } from "./colour"
import type { PaintLook } from "./map-theme"

// Pixel work on painted art, on RGBA data of width w and height h.

// Sharpens in place: each colour moves away from the average of its neighbours,
// by "amount". The average counts only what is there, by opacity, so the edge of
// a shape, where the colour beside it is nothing, makes no dark or light halo.
export function sharpen(pixels: Uint8ClampedArray, w: number, h: number, amount: number) {
  if (amount <= 0.001) return
  const before = new Uint8ClampedArray(pixels)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const at = (y * w + x) * 4
      if (before[at + 3] === 0) continue
      let weight = 0
      let r = 0
      let g = 0
      let b = 0
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = Math.min(Math.max(x + dx, 0), w - 1)
          const ny = Math.min(Math.max(y + dy, 0), h - 1)
          const n = (ny * w + nx) * 4
          const a = before[n + 3]
          weight += a
          r += before[n] * a
          g += before[n + 1] * a
          b += before[n + 2] * a
        }
      }
      pixels[at] = before[at] + (before[at] - r / weight) * amount
      pixels[at + 1] = before[at + 1] + (before[at + 1] - g / weight) * amount
      pixels[at + 2] = before[at + 2] + (before[at + 2] - b / weight) * amount
    }
  }
}

// Grades in place: the map's one look for painted art.
export function grade(pixels: Uint8ClampedArray, look: PaintLook["grade"], extraContrast: number) {
  const contrast = look.contrast + extraContrast
  const tint = look.tint.map((value) => 1 - look.tintAmount + (look.tintAmount * value) / 255)
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] === 0) continue
    const grey = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2]
    for (let c = 0; c < 3; c++) {
      let value = grey + (pixels[i + c] - grey) * look.saturation
      value = (value - 128) * contrast + 128 + look.brightness
      pixels[i + c] = value * tint[c]
    }
  }
}

// An average over 2r + 1 along each row and then each column, twice over, which
// is close to a soft blur.
function blur(alpha: Float32Array, w: number, h: number, r: number) {
  if (r < 1) return
  const pass = (source: Float32Array, stride: number, step: number, lines: number, length: number) => {
    const out = new Float32Array(source.length)
    for (let line = 0; line < lines; line++) {
      const start = line * stride
      let sum = 0
      for (let i = 0; i <= Math.min(r, length - 1); i++) sum += source[start + i * step]
      for (let i = 0; i < length; i++) {
        out[start + i * step] = sum / (2 * r + 1)
        if (i + r + 1 < length) sum += source[start + (i + r + 1) * step]
        if (i - r >= 0) sum -= source[start + (i - r) * step]
      }
    }
    return out
  }
  for (let round = 0; round < 2; round++) {
    alpha.set(pass(alpha, w, 1, h, w))
    alpha.set(pass(alpha, 1, w, w, h))
  }
}

// The soft shadow at the foot of a piece of art: the lowest part of its shape,
// squashed flat, blurred, and put a little to the right, since light is from the
// top left. Returns where it goes, relative to the art's own top left, and in
// the art's own pixels.
export function footShadow(pixels: Uint8ClampedArray, w: number, h: number, look: PaintLook["shadow"]) {
  const from = Math.floor(h * 0.7)
  const squash = 0.4
  const height = Math.max(2, Math.round((h - from) * squash))
  const radius = Math.max(1, Math.round(w * look.blur))
  const pad = radius * 3
  const shift = Math.round(w * 0.05)
  const width = w + pad * 2 + shift
  const total = height + pad * 2
  const alpha = new Float32Array(width * total)
  for (let y = 0; y < height; y++) {
    const rows = [Math.floor(from + y / squash), Math.floor(from + (y + 1) / squash) - 1]
    for (let x = 0; x < w; x++) {
      let strongest = 0
      for (let row = rows[0]; row <= Math.min(rows[1], h - 1); row++) strongest = Math.max(strongest, pixels[(row * w + x) * 4 + 3])
      alpha[(y + pad) * width + x + pad + shift] = strongest / 255
    }
  }
  blur(alpha, width, total, radius)
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = total
  const image = new ImageData(width, total)
  const colour: Rgb = look.colour
  for (let i = 0; i < alpha.length; i++) {
    image.data[i * 4] = colour[0]
    image.data[i * 4 + 1] = colour[1]
    image.data[i * 4 + 2] = colour[2]
    image.data[i * 4 + 3] = Math.min(alpha[i] * look.opacity * 255, 255)
  }
  canvas.getContext("2d")!.putImageData(image, 0, 0)
  return { canvas, left: -pad, top: h + Math.round(height * 0.3) - height - pad }
}
