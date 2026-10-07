import { Blend, Brush, Hand, Lasso, MousePointer2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type BuilderTool = "select" | "land" | "brush" | "blend" | "hand"
export type LandMode = "add" | "cut"

// How much of the canvas's left side the tool panel covers, in pixels: its handle
// alone when it is put away, and its width (w-56) with the handle (w-3) when open.
export const TOOL_PANEL_INSET = { closed: 12, open: 236 }

// The tools in the strip, in order, with the single key that picks each.
export const BUILDER_TOOLS: { id: BuilderTool; label: string; key: string; Icon: LucideIcon }[] = [
  { id: "select", label: "Select", key: "V", Icon: MousePointer2 },
  { id: "land", label: "Land", key: "L", Icon: Lasso },
  { id: "brush", label: "Biome brush", key: "B", Icon: Brush },
  { id: "blend", label: "Blend", key: "J", Icon: Blend },
  { id: "hand", label: "Pan", key: "H", Icon: Hand },
]
