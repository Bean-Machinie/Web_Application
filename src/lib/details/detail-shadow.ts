// The soft shadow a path or gravel casts on the land round it: a faint, close shade just
// below its edge, as if it were laid on the ground. It is the river's reverse, which is
// shaded inside its edge.
const SOFT = 2
const DROP = 0.75
const SHADE = "rgba(30, 20, 10, 0.28)"

// Draws the shadow of what is on "source" (its alpha) into "target", over the pixels "inner" of
// it; "from" is where in "source" its top left corner lies. All of "source" casts, so that the
// shade of what lies just outside the changed part is not lost.
export function castShadow(
  target: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  inner: { x: number; y: number; width: number; height: number },
  from: { x: number; y: number },
  scale: number
) {
  const shade = Object.assign(document.createElement("canvas"), { width: source.width, height: source.height })
  const context = shade.getContext("2d")!
  context.filter = `blur(${SOFT * scale}px)`
  context.drawImage(source, 0, DROP * scale)
  context.filter = "none"
  context.globalCompositeOperation = "source-in"
  context.fillStyle = SHADE
  context.fillRect(0, 0, shade.width, shade.height)
  context.globalCompositeOperation = "destination-out"
  context.drawImage(source, 0, 0)
  target.drawImage(shade, from.x, from.y, inner.width, inner.height, inner.x, inner.y, inner.width, inner.height)
}
