import { Droplets, Hand, Lasso, MousePointer2, Paintbrush } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type BuilderTool = "select" | "land" | "brush" | "blend" | "hand"
export type LandMode = "add" | "cut"
// How the select tool picks art: a box dragged out, or an outline drawn by hand.
export type SelectMode = "rectangle" | "lasso"
// What the pan tool does with a drag: moves the canvas, or turns it.
export type PanMode = "hand" | "rotate"
// What a pick does to the selection already there (Photoshop's way): it replaces it, or
// with Shift is added to it, with Alt is taken out of it, with both keeps what is in both.
export type SelectOp = "replace" | "add" | "subtract" | "intersect"

// How much of the canvas's left side the tool panel covers, in pixels: its handle
// alone when it is put away, and its width (w-56) with the handle (w-3) when open.
export const TOOL_PANEL_INSET = { closed: 12, open: 236 }

// The tools in the strip, in order, with the single key that picks each.
export const BUILDER_TOOLS: { id: BuilderTool; label: string; key: string; Icon: LucideIcon }[] = [
  { id: "hand", label: "Pan", key: "H", Icon: Hand },
  { id: "select", label: "Select", key: "V", Icon: MousePointer2 },
  { id: "land", label: "Land", key: "L", Icon: Lasso },
  { id: "brush", label: "Biome brush", key: "B", Icon: Paintbrush },
  { id: "blend", label: "Blend", key: "J", Icon: Droplets },
]
