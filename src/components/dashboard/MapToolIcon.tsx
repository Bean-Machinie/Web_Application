import { Lasso, Route, RotateCw, SquareDashed, SquaresSubtract, SquaresUnite } from "lucide-react"
import type { BrushLayer } from "@/hooks/use-brush"
import type { EraseTarget } from "@/lib/erase"
import { BUILDER_TOOLS } from "@/lib/map-builder-tools"
import type { BuilderTool, LandMode, PanMode, SelectMode } from "@/lib/map-builder-tools"

import { ERASE_ICONS } from "./map-erase-icons"

export type ToolModes = { land: LandMode; select: SelectMode; hand: PanMode; brush: BrushLayer; eraser: EraseTarget }

// The icon of a tool in the strip: the one of its sub tool in use, as Clip Studio
// does. The tools without sub tools keep a fixed one.
export function MapToolIcon({ tool, modes }: { tool: BuilderTool; modes: ToolModes }) {
  if (tool === "land") return modes.land === "cut" ? <SquaresSubtract /> : <SquaresUnite />
  if (tool === "select") return modes.select === "lasso" ? <Lasso /> : <SquareDashed />
  if (tool === "hand" && modes.hand === "rotate") return <RotateCw />
  if (tool === "brush" && modes.brush === "details") return <Route />
  if (tool === "eraser") {
    const Icon = ERASE_ICONS[modes.eraser]
    return <Icon />
  }
  const { Icon } = BUILDER_TOOLS.find(({ id }) => id === tool)!
  return <Icon />
}
