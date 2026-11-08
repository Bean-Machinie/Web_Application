export type Vec3 = [number, number, number]

const PHI = (1 + Math.sqrt(5)) / 2
const SCALE = 1 / Math.sqrt(1 + PHI * PHI)

// The twelve corners of a d20, on a sphere of radius 1.
export const VERTICES: Vec3[] = [
  [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
  [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
  [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
].map(([x, y, z]) => [x * SCALE, y * SCALE, z * SCALE])

const EDGE_LENGTH = 2 * SCALE
const near = (a: Vec3, b: Vec3) => Math.abs(Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) - EDGE_LENGTH) < 1e-6

const pairs: [number, number][] = []
for (let i = 0; i < VERTICES.length; i++) for (let j = i + 1; j < VERTICES.length; j++) if (near(VERTICES[i], VERTICES[j])) pairs.push([i, j])

// The thirty edges, each as a row of dots from corner to corner (the corners only once).
export function edgeDots(perEdge: number): Vec3[] {
  const dots: Vec3[] = VERTICES.map((v) => [...v] as Vec3)
  for (const [i, j] of pairs) {
    const [a, b] = [VERTICES[i], VERTICES[j]]
    for (let k = 1; k < perEdge; k++) {
      const t = k / perEdge
      dots.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t])
    }
  }
  return dots
}

// The twenty faces, as their three corners.
export const FACES: [Vec3, Vec3, Vec3][] = []
for (const [i, j] of pairs) {
  for (let k = j + 1; k < VERTICES.length; k++) {
    if (near(VERTICES[i], VERTICES[k]) && near(VERTICES[j], VERTICES[k])) FACES.push([VERTICES[i], VERTICES[j], VERTICES[k]])
  }
}

// The centre of each face, in the order of FACES.
export const FACE_CENTRES: Vec3[] = FACES.map(([a, b, c]) => [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3])

// Dots spread evenly inside each face, off its edges, `steps` to a side; each with its face's index.
export function faceDots(steps: number): { face: number; point: Vec3 }[] {
  return FACES.flatMap(([a, b, c], face) => {
    const dots: { face: number; point: Vec3 }[] = []
    for (let i = 1; i < steps; i++) {
      for (let j = 1; i + j < steps; j++) {
        const [u, v, w] = [i / steps, j / steps, (steps - i - j) / steps]
        dots.push({ face, point: [a[0] * u + b[0] * v + c[0] * w, a[1] * u + b[1] * v + c[1] * w, a[2] * u + b[2] * v + c[2] * w] })
      }
    }
    return dots
  })
}

// Turns a point about the vertical axis by yaw, then about the horizontal one by pitch.
export function rotate([x, y, z]: Vec3, yaw: number, pitch: number): Vec3 {
  const x1 = x * Math.cos(yaw) + z * Math.sin(yaw)
  const z1 = -x * Math.sin(yaw) + z * Math.cos(yaw)
  return [x1, y * Math.cos(pitch) - z1 * Math.sin(pitch), y * Math.sin(pitch) + z1 * Math.cos(pitch)]
}

// The yaw and pitch that turn a direction to face the viewer (along +z).
export function facing([x, y, z]: Vec3) {
  const yaw = Math.atan2(-x, z)
  return { yaw, pitch: Math.atan2(y, Math.hypot(x, z)) }
}
