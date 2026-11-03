// Where a die's faces are in the texture the library stretches over them. Sizes are parts of the texture's
// width, angles are in radians in the frame a label is drawn in (y down, measured the way canvas does).
export type FaceShape = {
  // The circle that fits inside a face, and the circle through its corners.
  inradius: number
  circumradius: number
  corners: number[]
  // The corners themselves, in pixels of a 512 pixel label in the order around the face; none where a
  // corner falls outside the texture (the d20) or the layout is not known.
  points?: { x: number; y: number }[]
  // Where and how large the library draws its own numerals, in the same pixels.
  numeral: { size: number; y: number; x?: number }
}

const SIZE = 512
// The circumradius of the d20 face once its layout is fitted; dice-face-fit.ts uses the same value.
const FITTED = 0.46
const rad = (degrees: number) => (degrees * Math.PI) / 180

// The library lays a face's corners out at `start` plus equal steps in texture space, which is flipped
// against the canvas, then turns the canvas by `turn` so its own numerals stand upright.
const corners = (count: number, start: number, turn: number) =>
  Array.from({ length: count }, (_, index) => -(rad(start) + (index * 2 * Math.PI) / count) - rad(turn))

const points = (angles: number[], circumradius: number) =>
  angles.map((angle) => ({ x: SIZE / 2 + circumradius * SIZE * Math.cos(angle), y: SIZE / 2 + circumradius * SIZE * Math.sin(angle) }))

// The d10's face is a kite whose four corners the library places by hand in texture space (u across, v up).
// They are flipped into canvas pixels, then turned back by the canvas's own turn of -6 degrees.
const KITE_SIDE = 0.65
const KITE_LOW = 1 - (0.895 / 1.105) * 0.85
const kite = [
  [0.5 - KITE_SIDE / 2, KITE_LOW],
  [0.5, 0.15],
  [0.5 + KITE_SIDE / 2, KITE_LOW],
  [0.5, 1],
].map(([u, v]) => {
  const dx = u * SIZE - SIZE / 2
  const dy = (1 - v) * SIZE - SIZE / 2
  const turn = rad(6)
  return { x: SIZE / 2 + dx * Math.cos(turn) - dy * Math.sin(turn), y: SIZE / 2 + dx * Math.sin(turn) + dy * Math.cos(turn) }
})

// The library's numerals: 170 pt (227 px) a little below the middle, three quarters of that on the d10.
const NUMERAL = { size: (SIZE / 3) * (4 / 3), y: SIZE / 2 + 10 }
const D10_NUMERAL = { size: NUMERAL.size * 0.75, y: (SIZE / 2 + 10) * 1.15 - 10 }

// The distance from a point to the nearest edge of a face: the largest circle about it that fits.
const clearance = (corners: { x: number; y: number }[], about: { x: number; y: number }) =>
  Math.min(
    ...corners.map((a, index) => {
      const b = corners[(index + 1) % corners.length]
      return Math.abs((b.x - a.x) * (a.y - about.y) - (a.x - about.x) * (b.y - a.y)) / Math.hypot(b.x - a.x, b.y - a.y)
    })
  )

export const FACE_SHAPES: Record<string, FaceShape> = {
  d6: { inradius: 0.32, circumradius: 0.4545, corners: corners(4, 45, 0), points: points(corners(4, 45, 0), 0.4545), numeral: NUMERAL },
  d8: { inradius: 0.25, circumradius: 0.5, corners: corners(3, -22.5, -7.5), points: points(corners(3, -22.5, -7.5), 0.5), numeral: NUMERAL },
  // A kite whose corners the library places by hand; the library puts its numeral at the middle of the circle that fits in it.
  d10: { inradius: clearance(kite, { x: SIZE / 2, y: D10_NUMERAL.y }) / SIZE, circumradius: 0.385, corners: [], points: kite, numeral: D10_NUMERAL },
  d12: { inradius: 0.337, circumradius: 0.417, corners: corners(5, -22.5, 5), points: points(corners(5, -22.5, 5), 0.417), numeral: NUMERAL },
  // Its corners lie beyond the texture, so only the middle of each edge shows.
  d20: { inradius: 0.31, circumradius: 0.625, corners: corners(3, -22.5, -7.5), numeral: { ...NUMERAL, x: SIZE / 2 - 0.02 * (SIZE / 2) } },
  // The same face with its corners pulled inside the texture (see dice-face-fit.ts). The face shows more
  // magnified by the ratio of the radii, so the library's numerals are drawn smaller by it to look the same.
  d20fit: {
    inradius: 0.23,
    circumradius: FITTED,
    corners: corners(3, -22.5, -7.5),
    points: points(corners(3, -22.5, -7.5), FITTED),
    numeral: {
      size: NUMERAL.size * (FITTED / 0.625),
      y: SIZE / 2 + 10 * (FITTED / 0.625),
      x: SIZE / 2 - 0.02 * (SIZE / 2) * (FITTED / 0.625),
    },
  },
}
