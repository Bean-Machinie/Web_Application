// An image as a swarm of small squares, one per cell of a grid over the box, each the colour of the
// image there. The grid depends only on the box, so every image of one box has the same number of
// squares and they can fly from one picture to the next.
export type Sample = { xs: Float32Array; ys: Float32Array; rgb: Uint8ClampedArray; size: number }

export type Swarm = {
  x: Float32Array
  y: Float32Array
  vx: Float32Array
  vy: Float32Array
  // Each square's home flies from one place and colour to another, from the start time on.
  from: Sample
  to: Sample
  // Which cell of `to` each square flies to.
  order: Uint32Array
  start: number
}

const TARGET = 1500
const FLIGHT_MS = 600
const SPRING = 0.12
const DAMPING = 0.8
const REACH = 55
const PUSH = 5

// Samples the image, covering the box, onto the grid; null when its pixels cannot be read.
export function sampleImage(image: HTMLImageElement, width: number, height: number): Sample | null {
  const step = Math.sqrt((width * height) / TARGET)
  const cols = Math.max(1, Math.floor(width / step))
  const rows = Math.max(1, Math.floor(height / step))
  const scale = Math.max(cols / image.naturalWidth, rows / image.naturalHeight)
  const [sw, sh] = [cols / scale, rows / scale]
  const small = document.createElement("canvas")
  small.width = cols
  small.height = rows
  const ctx = small.getContext("2d", { willReadFrequently: true })
  if (!ctx) return null
  ctx.drawImage(image, (image.naturalWidth - sw) / 2, (image.naturalHeight - sh) / 2, sw, sh, 0, 0, cols, rows)
  let pixels: Uint8ClampedArray
  try {
    pixels = ctx.getImageData(0, 0, cols, rows).data
  } catch {
    return null
  }
  const count = cols * rows
  const sample = { xs: new Float32Array(count), ys: new Float32Array(count), rgb: new Uint8ClampedArray(count * 3), size: step * 0.7 }
  for (let i = 0; i < count; i++) {
    sample.xs[i] = ((i % cols) + 0.5) * (width / cols)
    sample.ys[i] = (Math.floor(i / cols) + 0.5) * (height / rows)
    sample.rgb.set(pixels.subarray(i * 4, i * 4 + 3), i * 3)
  }
  return sample
}

const identity = (count: number) => Uint32Array.from({ length: count }, (_, i) => i)

export function newSwarm(sample: Sample): Swarm {
  const count = sample.xs.length
  return { x: sample.xs.slice(), y: sample.ys.slice(), vx: new Float32Array(count), vy: new Float32Array(count), from: sample, to: sample, order: identity(count), start: 0 }
}

// Sends every square to a random cell of the new picture, from where its home is now.
export function flyTo(swarm: Swarm, sample: Sample, now: number, instant: boolean) {
  const order = identity(sample.xs.length)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  swarm.from = { xs: swarm.x.slice(), ys: swarm.y.slice(), rgb: colours(swarm, now), size: swarm.to.size }
  Object.assign(swarm, { to: sample, order, start: instant ? -Infinity : now })
}

const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)
const progress = (swarm: Swarm, now: number) => ease(Math.min(1, Math.max(0, (now - swarm.start) / FLIGHT_MS)))

// Each square's colour now, part way from its old one to its new one.
export function colours(swarm: Swarm, now: number) {
  const k = progress(swarm, now)
  const out = new Uint8ClampedArray(swarm.x.length * 3)
  for (let i = 0; i < swarm.x.length; i++) {
    for (let c = 0; c < 3; c++) out[i * 3 + c] = swarm.from.rgb[i * 3 + c] + (swarm.to.rgb[swarm.order[i] * 3 + c] - swarm.from.rgb[i * 3 + c]) * k
  }
  return out
}

// Moves the squares one frame on: springs pull them home, the pointer pushes them away. True while
// anything still moves.
export function step(swarm: Swarm, now: number, pointer: { x: number; y: number } | null, still: boolean) {
  const k = progress(swarm, now)
  let moving = k < 1
  for (let i = 0; i < swarm.x.length; i++) {
    const target = swarm.order[i]
    const hx = swarm.from.xs[i] + (swarm.to.xs[target] - swarm.from.xs[i]) * k
    const hy = swarm.from.ys[i] + (swarm.to.ys[target] - swarm.from.ys[i]) * k
    if (still) {
      swarm.x[i] = hx
      swarm.y[i] = hy
      continue
    }
    let ax = (hx - swarm.x[i]) * SPRING
    let ay = (hy - swarm.y[i]) * SPRING
    if (pointer) {
      const dx = swarm.x[i] - pointer.x
      const dy = swarm.y[i] - pointer.y
      const d = Math.hypot(dx, dy)
      if (d < REACH && d > 0.01) {
        ax += (dx / d) * (1 - d / REACH) * PUSH
        ay += (dy / d) * (1 - d / REACH) * PUSH
      }
    }
    swarm.vx[i] = (swarm.vx[i] + ax) * DAMPING
    swarm.vy[i] = (swarm.vy[i] + ay) * DAMPING
    swarm.x[i] += swarm.vx[i]
    swarm.y[i] += swarm.vy[i]
    if (Math.abs(swarm.vx[i]) + Math.abs(swarm.vy[i]) > 0.02) moving = true
  }
  return moving
}
