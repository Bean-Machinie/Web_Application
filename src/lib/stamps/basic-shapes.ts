import type { Pair, Ring } from "polygon-clipping"
import type { Stamp } from "./stamps"

// A round outline has a point about this many canvas pixels along it, so a large
// circle or oval stays smooth, and a small one is not made of more than it can show.
const POINT_SPACING = 4
const FEWEST_POINTS = 24
const MOST_POINTS = 1440

// Ramanujan's approximation of the length of the oval's edge.
const perimeter = (a: number, b: number) => Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)))

function ovalRing(width: number, height: number): Ring {
  const length = perimeter(width / 2, height / 2)
  const count = Math.min(Math.max(Math.ceil(length / POINT_SPACING), FEWEST_POINTS), MOST_POINTS)
  const points: Pair[] = Array.from({ length: count }, (_, i) => {
    const turn = (i / count) * Math.PI * 2
    return [0.5 + 0.5 * Math.cos(turn), 0.5 + 0.5 * Math.sin(turn)]
  })
  return [...points, points[0]]
}

const closed = (points: Pair[]): Ring => [...points, points[0]]

// A regular hexagon with a flat top, stretched to fill the box.
const hexagon = closed(
  Array.from({ length: 6 }, (_, i): Pair => {
    const turn = (i / 6) * Math.PI * 2
    return [0.5 + 0.5 * Math.cos(turn), 0.5 + (0.5 * Math.sin(turn)) / Math.sin(Math.PI / 3)]
  })
)

export const BASIC_STAMPS: Stamp[] = [
  { id: "circle", name: "Circle", group: "basic", aspect: 1, rings: (width, height) => [ovalRing(width, height)] },
  {
    id: "rectangle",
    name: "Rectangle",
    group: "basic",
    aspect: 1.5,
    corners: true,
    rings: [closed([[0, 0], [1, 0], [1, 1], [0, 1]])],
  },
  { id: "triangle", name: "Triangle", group: "basic", aspect: 2 / Math.sqrt(3), corners: true, rings: [closed([[0.5, 0], [1, 1], [0, 1]])] },
  { id: "hexagon", name: "Hexagon", group: "basic", aspect: 2 / Math.sqrt(3), corners: true, rings: [hexagon] },
]
