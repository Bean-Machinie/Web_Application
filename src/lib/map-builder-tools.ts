import { Blend, Brush, Hand, Lasso, MousePointer2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type BuilderTool = "select" | "land" | "brush" | "blend" | "hand"
export type LandMode = "add" | "cut"

// Select and Pan have nothing to set, so the tool panel is closed for them.
export const toolHasSettings = (tool: BuilderTool) => tool !== "select" && tool !== "hand"

// The tools in the strip, in order, with the single key that picks each.
export const BUILDER_TOOLS: { id: BuilderTool; label: string; key: string; Icon: LucideIcon }[] = [
  { id: "select", label: "Select", key: "V", Icon: MousePointer2 },
  { id: "land", label: "Land", key: "L", Icon: Lasso },
  { id: "brush", label: "Biome brush", key: "B", Icon: Brush },
  { id: "blend", label: "Blend", key: "J", Icon: Blend },
  { id: "hand", label: "Pan", key: "H", Icon: Hand },
]
