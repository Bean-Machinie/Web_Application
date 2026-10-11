import { Circle, Hexagon, RectangleHorizontal, Triangle } from "lucide-react"
import type { LucideIcon } from "lucide-react"

// The icon of each basic shape, by the id of its stamp, for its row in the Shapes tab.
export const SHAPE_ICONS: Partial<Record<string, LucideIcon>> = {
  circle: Circle,
  rectangle: RectangleHorizontal,
  triangle: Triangle,
  hexagon: Hexagon,
}
