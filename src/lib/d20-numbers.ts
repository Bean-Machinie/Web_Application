import { GLYPH_HEIGHT, numberWidth, strokeDepth } from "./d20-glyphs"
import { FACE_CENTRES, FACES, faceDots } from "./icosahedron"
import type { Vec3 } from "./icosahedron"
import { REST_PITCH } from "./d20-motion"

// Dots a side of each face: one grid for the face and its number alike.
export const FACE_STEPS = 48
// How large a digit's unit is on a face (a digit is 1 wide and GLYPH_HEIGHT high).
const UNIT = 0.19
// The face's dot spacing, in digit units, over which a stroke's edge fades out, so it reads smooth.
const SPACING = 1.0515 / FACE_STEPS / UNIT
// How strong a stroke dot is drawn is rounded to these steps, so dots of a strength go out together.
const LEVELS = 4

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const unit = (v: Vec3): Vec3 => {
  const length = Math.hypot(...v)
  return [v[0] / length, v[1] / length, v[2] / length]
}
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]

const oppositeOf = (face: number) => FACE_CENTRES.findIndex((other) => dot(unit(other), unit(FACE_CENTRES[face])) < -0.999)

// How high on the die a face shows as the idle turn brings it round to the front, at the die's resting
// tilt; faces it never turns well toward the viewer do not count.
function shownHeight([x, y, z]: Vec3) {
  const across = Math.hypot(x, z)
  const toward = y * Math.sin(REST_PITCH) + across * Math.cos(REST_PITCH)
  return toward > 0.5 ? y * Math.cos(REST_PITCH) - across * Math.sin(REST_PITCH) : -Infinity
}

// As on a real d20, opposite faces add up to 21. The 20 goes on the face shown highest as the die idles,
// as most of the die's lower part is cut off by its tile.
const TWENTY = FACE_CENTRES.reduce((best, centre, face) => (shownHeight(centre) > shownHeight(FACE_CENTRES[best]) ? face : best), 0)
const NUMBERS: number[] = []
NUMBERS[TWENTY] = 20
NUMBERS[oppositeOf(TWENTY)] = 1
let next = 2
FACE_CENTRES.forEach((_, face) => {
  if (NUMBERS[face]) return
  NUMBERS[face] = next
  NUMBERS[oppositeOf(face)] = 21 - next
  next++
})

// Straight up the die, laid flat on each face, so its number stands upright as the die turns; any turn of
// the number fits, as it stays inside the face's inscribed circle.
const UPS = FACE_CENTRES.map((centre) => {
  const normal = unit(centre)
  return unit(sub([0, 1, 0], [normal[0] * normal[1], normal[1] * normal[1], normal[2] * normal[1]]))
})

// How much of a face's dot is on its number's strokes, 0 to 1, rounded to LEVELS steps. The number reads
// upright on the die, centred on the face.
function inkOf(face: number, point: Vec3) {
  const centre = FACE_CENTRES[face]
  const up = UPS[face]
  const right = cross(up, unit(centre))
  const offset = sub(point, centre)
  const value = NUMBERS[face]
  const x = dot(offset, right) / UNIT + numberWidth(value) / 2
  const y = -dot(offset, up) / UNIT + GLYPH_HEIGHT / 2
  const ink = (strokeDepth(value, x, y) + SPACING / 2) / SPACING
  return Math.ceil(Math.max(0, Math.min(1, ink)) * LEVELS) / LEVELS
}

export type FaceDots = { plain: Vec3[]; strokes: Vec3[][] }

// Each face's dots, split into the plain ones and those on its number's strokes, by strength (the
// strongest last).
export const FACE_DOTS: FaceDots[] = FACES.map(() => ({ plain: [], strokes: Array.from({ length: LEVELS }, () => []) }))
for (const { face, point } of faceDots(FACE_STEPS)) {
  const ink = inkOf(face, point)
  if (ink < 1) FACE_DOTS[face].plain.push(point)
  if (ink > 0) FACE_DOTS[face].strokes[ink * LEVELS - 1].push(point)
}
