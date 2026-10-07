import { Brush, Hand, Lasso, MousePointer2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type BuilderTool = "select" | "land" | "brush" | "hand"
export type LandMode = "add" | "cut"

// The tools in the strip, in order, with the single key that picks each.
export const BUILDER_TOOLS: { id: BuilderTool; label: string; key: string; Icon: LucideIcon }[] = [
  { id: "select", label: "Select", key: "V", Icon: MousePointer2 },
  { id: "land", label: "Land", key: "L", Icon: Lasso },
  { id: "brush", label: "Biome brush", key: "B", Icon: Brush },
  { id: "hand", label: "Pan", key: "H", Icon: Hand },
]
