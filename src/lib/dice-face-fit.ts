import type DiceBox from "@3d-dice/dice-box-threejs"

// The library lays a d20's labels out so far past the texture that its corners fall outside it. Reducing
// that overshoot is a change to how the face's corners are placed in the texture (the geometry itself is
// the same), and the value is hard-coded inside the library's own geometry builder, not in the die
// definitions. This wraps that builder on our own factories only, and does nothing unless the builder
// looks the way it did in 0.0.12 (the version package.json pins).
const FITTED_RADIUS = 0.46
// What the library uses for the d20, and what it builds from.
const D20_MARGIN = -0.2
const D20_START = -Math.PI / 8
// The d20 is drawn this much larger than the library makes it, which only reads as a size on thrown dice.
const D20_SIZE = 1.3
export const FITTED_MARGIN = 1 / (2 * FITTED_RADIUS) - 1

type Builder = (this: unknown, ...args: unknown[]) => unknown
type Factory = { make_geom?: unknown; create_geom?: unknown; geometries?: Record<string, unknown> }

const controls = new WeakMap<object, { fit: boolean }>()
let available = false

// Whether the override is in place on every box made so far.
export const faceFitAvailable = () => available

// Call once on each box, before any die is made.
export function installFaceFit(box: DiceBox) {
  const factory = box.DiceFactory as unknown as Factory
  const original = factory.make_geom
  if (typeof original !== "function" || original.length !== 5 || typeof factory.create_geom !== "function" || typeof factory.geometries !== "object") {
    console.warn("The dice library's geometry builder is not as expected, so the d20 keeps its plain numerals.")
    available = false
    return
  }
  const control = { fit: false }
  controls.set(factory, control)
  factory.make_geom = function (this: unknown, vectors, faces, scale, margin, start) {
    const isD20 = margin === D20_MARGIN && Math.abs((start as number) - D20_START) < 1e-9
    const size = isD20 ? (scale as number) * D20_SIZE : scale
    try {
      return (original as Builder).call(this, vectors, faces, size, control.fit && isD20 ? FITTED_MARGIN : margin, start)
    } catch (error) {
      console.warn("The d20's fitted layout failed, so the library's own was used.", error)
      return (original as Builder).call(this, vectors, faces, size, margin, start)
    }
  } as Builder
  available = true
}

// Turns the fitted layout on or off for the next d20 this box makes. Dice already made keep theirs.
export function setFaceFit(box: DiceBox, on: boolean) {
  const factory = box.DiceFactory as unknown as Factory
  const control = controls.get(factory)
  if (!control || control.fit === on) return
  control.fit = on
  // The library keeps one geometry per die type, so it is made again with the other layout.
  delete factory.geometries?.d20
}
