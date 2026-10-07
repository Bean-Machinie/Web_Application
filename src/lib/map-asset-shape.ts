// What is worked out once for each kind of art, when its picture loads: where
// the painted pixels are (so the empty margin around it can be ignored), and
// the shape of them (so a click on an empty corner goes to what is behind). It
// is shared by every copy placed on a map, so a crowded map costs no more.

// Where the picture is painted, in its own pixels.
export type Trim = { x: number; y: number; width: number; height: number }

export type AssetShape = {
  // Whether the art is painted in colour, and not drawn in ink: see PAINTED_SHARE.
  colour: boolean
  trim: Trim
  // The painted pixels as a path, in pixels from the trim's top left corner.
  hit: Path2D
}

// A pixel counts as painted from this much opacity (of 255).
const PAINTED = 20
// A pixel counts as coloured when it is this saturated (and not nearly black),
// and art is painted, not ink, when this share of what it covers is coloured.
const COLOURED = 0.2
const PAINTED_SHARE = 0.08
// Pictures are looked at no larger than this on their long side.
const MAX_LOOK = 640

export function shapeOf(image: HTMLImageElement): AssetShape {
  const whole: Trim = { x: 0, y: 0, width: image.naturalWidth, height: image.naturalHeight }
  const scale = Math.min(1, MAX_LOOK / Math.max(whole.width, whole.height))
  const w = Math.max(1, Math.round(whole.width * scale))
  const h = Math.max(1, Math.round(whole.height * scale))

  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const context = canvas.getContext("2d", { willReadFrequently: true })!
  context.drawImage(image, 0, 0, w, h)
  const { data } = context.getImageData(0, 0, w, h)
  const painted = (x: number, y: number) => data[(y * w + x) * 4 + 3] >= PAINTED

  let opaque = 0
  let coloured = 0
  for (let i = 0; i < w * h; i++) {
    if (data[i * 4 + 3] < PAINTED) continue
    opaque++
    const high = Math.max(data[i * 4], data[i * 4 + 1], data[i * 4 + 2])
    const low = Math.min(data[i * 4], data[i * 4 + 1], data[i * 4 + 2])
    if (high > 40 && (high - low) / high > COLOURED) coloured++
  }
  const colour = opaque > 0 && coloured / opaque > PAINTED_SHARE

  let minX = w
  let minY = h
  let maxX = -1
  let maxY = -1
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!painted(x, y)) continue
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }
  // A picture with nothing painted keeps its whole size, and all of it counts.
  if (maxX < 0) {
    const hit = new Path2D()
    hit.rect(0, 0, whole.width, whole.height)
    return { colour, trim: whole, hit }
  }

  // Back to the picture's own pixels, rounded outwards so nothing is cut off.
  const x0 = Math.max(0, Math.floor(minX / scale))
  const y0 = Math.max(0, Math.floor(minY / scale))
  const x1 = Math.min(whole.width, Math.ceil((maxX + 1) / scale))
  const y1 = Math.min(whole.height, Math.ceil((maxY + 1) / scale))
  const trim = { x: x0, y: y0, width: x1 - x0, height: y1 - y0 }

  // The painted pixels as rectangles: runs along each row, and runs that stay
  // the same from row to row joined into one, which keeps the path small.
  const hit = new Path2D()
  const open = new Map<string, number>()
  const close = (key: string, endRow: number) => {
    const [from, to] = key.split(":").map(Number)
    const top = open.get(key)!
    hit.rect(
      from / scale - trim.x,
      top / scale - trim.y,
      (to - from) / scale,
      (endRow - top) / scale
    )
    open.delete(key)
  }
  for (let y = minY; y <= maxY + 1; y++) {
    const runs = new Set<string>()
    let start = -1
    for (let x = minX; x <= maxX + 1; x++) {
      const on = y <= maxY && x <= maxX && painted(x, y)
      if (on && start < 0) start = x
      if (!on && start >= 0) {
        runs.add(`${start}:${x}`)
        start = -1
      }
    }
    for (const key of [...open.keys()]) if (!runs.has(key)) close(key, y)
    for (const key of runs) if (!open.has(key)) open.set(key, y)
  }
  return { colour, trim, hit }
}
