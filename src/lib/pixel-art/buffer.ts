export type Rgb = [number, number, number]

export const hex = (value: string): Rgb => [parseInt(value.slice(1, 3), 16), parseInt(value.slice(3, 5), 16), parseInt(value.slice(5, 7), 16)]

export const mix = (a: Rgb, b: Rgb, amount: number): Rgb => [
  Math.round(a[0] + (b[0] - a[0]) * amount),
  Math.round(a[1] + (b[1] - a[1]) * amount),
  Math.round(a[2] + (b[2] - a[2]) * amount),
]

// A pixel as the canvas stores it: 0xAABBGGRR on a little-endian machine, which is every browser that
// matters. 0 is transparent.
export const pack = ([r, g, b]: Rgb, alpha = 255) => ((Math.round(alpha) << 24) | (b << 16) | (g << 8) | r) >>> 0

// A picture of whole pixels that can share the memory of a canvas's image data. Anything drawn off
// the edge is dropped.
export class Buf {
  readonly w: number
  readonly h: number
  readonly data: Uint32Array

  constructor(w: number, h: number, data?: Uint32Array) {
    this.w = w
    this.h = h
    this.data = data ?? new Uint32Array(w * h)
  }

  clear() {
    this.data.fill(0)
  }

  set(x: number, y: number, color: number) {
    x = Math.round(x)
    y = Math.round(y)
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.data[y * this.w + x] = color
  }

  rect(x: number, y: number, w: number, h: number, color: number) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, color)
  }

  // A line `thick` pixels wide between two points, drawn as a run of squares.
  line(x0: number, y0: number, x1: number, y1: number, thick: number, color: number) {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1)
    for (let i = 0; i <= steps; i++) this.rect(x0 + ((x1 - x0) * i) / steps, y0 + ((y1 - y0) * i) / steps, thick, thick, color)
  }
}
