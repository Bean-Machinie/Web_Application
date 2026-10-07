// How the builder's canvas is shown on the screen: moved, zoomed, turned and
// mirrored. This is the one place that knows how the four combine, so nothing else
// has to; the map itself is never touched by any of it.

export type Point = { x: number; y: number }
export type Size = { width: number; height: number }

export type BuilderView = {
  // Where the canvas's own origin lands on the screen.
  x: number
  y: number
  scale: number
  // Clockwise, in degrees, as seen.
  rotation: number
  // The canvas is mirrored left to right, or top to bottom, before it is turned.
  flipH: boolean
  flipV: boolean
}

const radians = (degrees: number) => (degrees * Math.PI) / 180

// The turn, mirror and zoom together, as the four numbers of a matrix:
// screen = [a c; b d] * canvas + (x, y).
function matrix(view: BuilderView) {
  const turn = radians(view.rotation)
  const sx = view.scale * (view.flipH ? -1 : 1)
  const sy = view.scale * (view.flipV ? -1 : 1)
  return { a: Math.cos(turn) * sx, b: Math.sin(turn) * sx, c: -Math.sin(turn) * sy, d: Math.cos(turn) * sy }
}

export function toScreen(view: BuilderView, point: Point): Point {
  const { a, b, c, d } = matrix(view)
  return { x: a * point.x + c * point.y + view.x, y: b * point.x + d * point.y + view.y }
}

export function toCanvas(view: BuilderView, point: Point): Point {
  const { a, b, c, d } = matrix(view)
  const det = a * d - b * c
  const dx = point.x - view.x
  const dy = point.y - view.y
  return { x: (d * dx - c * dy) / det, y: (a * dy - b * dx) / det }
}

// The same view, moved so that a point of the canvas is at a point of the screen.
export function holdingAt(view: BuilderView, canvasPoint: Point, screenPoint: Point): BuilderView {
  const moved = toScreen({ ...view, x: 0, y: 0 }, canvasPoint)
  return { ...view, x: screenPoint.x - moved.x, y: screenPoint.y - moved.y }
}

// What Konva's stage is given. A stage turns after it mirrors, as the view does.
export const stageProps = (view: BuilderView) => ({
  x: view.x,
  y: view.y,
  rotation: view.rotation,
  scaleX: view.scale * (view.flipH ? -1 : 1),
  scaleY: view.scale * (view.flipV ? -1 : 1),
})

// A mirror of the screen, not of the canvas: what was tilted one way is now tilted
// the other, so the turn changes sign, and the view holds the point it is turned on.
export function flipped(view: BuilderView, axis: "h" | "v", about: Point): BuilderView {
  const middle = toCanvas(view, about)
  const next = {
    ...view,
    rotation: normalAngle(-view.rotation),
    flipH: axis === "h" ? !view.flipH : view.flipH,
    flipV: axis === "v" ? !view.flipV : view.flipV,
  }
  return holdingAt(next, middle, about)
}

// Turned to an angle about a point of the screen.
export function turnedTo(view: BuilderView, rotation: number, about: Point): BuilderView {
  return holdingAt({ ...view, rotation: normalAngle(rotation) }, toCanvas(view, about), about)
}

// -180 (excluded) to 180.
export function normalAngle(degrees: number) {
  const turned = ((((degrees + 180) % 360) + 360) % 360) - 180
  return turned === -180 ? 180 : turned
}

// The four corners, on the canvas, of a rectangle of the screen.
export function cornersOnCanvas(view: BuilderView, left: number, top: number, right: number, bottom: number): Point[] {
  return [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom },
  ].map((corner) => toCanvas(view, corner))
}

// The smallest upright rectangle of the canvas that holds what can be seen of the
// screen, with a margin (a share of the screen) all round, kept to the canvas.
export function visibleRect(view: BuilderView, size: Size, canvas: Size, margin = 0) {
  const room = { x: size.width * margin, y: size.height * margin }
  const corners = cornersOnCanvas(view, -room.x, -room.y, size.width + room.x, size.height + room.y)
  const xs = corners.map((corner) => corner.x)
  const ys = corners.map((corner) => corner.y)
  const left = Math.max(Math.min(...xs), 0)
  const top = Math.max(Math.min(...ys), 0)
  const right = Math.min(Math.max(...xs), canvas.width)
  const bottom = Math.min(Math.max(...ys), canvas.height)
  return { left, top, right, bottom }
}

// How large a canvas is on the screen at a zoom, turned: the upright rectangle
// that holds it. Fitting uses this, so a turned canvas still fits whole.
export function turnedExtent(canvas: Size, rotation: number): Size {
  const turn = radians(rotation)
  const cos = Math.abs(Math.cos(turn))
  const sin = Math.abs(Math.sin(turn))
  return { width: canvas.width * cos + canvas.height * sin, height: canvas.width * sin + canvas.height * cos }
}
