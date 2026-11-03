// Where a die's faces are in the texture the library stretches over them. Sizes are parts of the texture's
// width, angles are in radians in the frame a label is drawn in (y down, measured the way canvas does).
export type FaceShape = {
  // The circle that fits inside a face, and the circle through its corners.
  inradius: number
  circumradius: number
  corners: number[]
}

const rad = (degrees: number) => (degrees * Math.PI) / 180

// The library lays a face's corners out at `start` plus equal steps in texture space, which is flipped
// against the canvas, then turns the canvas by `turn` so its own numerals stand upright.
const corners = (count: number, start: number, turn: number) =>
  Array.from({ length: count }, (_, index) => -(rad(start) + (index * 2 * Math.PI) / count) - rad(turn))

export const FACE_SHAPES: Record<string, FaceShape> = {
  d6: { inradius: 0.32, circumradius: 0.4545, corners: corners(4, 45, 0) },
  d8: { inradius: 0.25, circumradius: 0.5, corners: corners(3, -22.5, -7.5) },
  // A kite with its own texture layout, so no corners are known and none are drawn toward.
  d10: { inradius: 0.2, circumradius: 0.385, corners: [] },
  d12: { inradius: 0.337, circumradius: 0.417, corners: corners(5, -22.5, 5) },
  d20: { inradius: 0.31, circumradius: 0.625, corners: corners(3, -22.5, -7.5) },
}
