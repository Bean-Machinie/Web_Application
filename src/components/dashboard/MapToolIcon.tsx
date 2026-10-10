import { Lasso, RotateCw, SquareDashed, SquaresSubtract, SquaresUnite } from "lucide-react"
import { BUILDER_TOOLS } from "@/lib/map-builder-tools"
import type { BuilderTool, LandMode, PanMode, SelectMode } from "@/lib/map-builder-tools"

export type ToolModes = { land: LandMode; select: SelectMode; hand: PanMode }

// The icon of a tool in the strip: the one of its sub tool in use, as Clip Studio
// does. The tools without sub tools keep a fixed one.
export function MapToolIcon({ tool, modes }: { tool: BuilderTool; modes: ToolModes }) {
  if (tool === "land") return modes.land === "cut" ? <SquaresSubtract /> : <SquaresUnite />
  if (tool === "select") return modes.select === "lasso" ? <Lasso /> : <SquareDashed />
  if (tool === "hand" && modes.hand === "rotate") return <RotateCw />
  const { Icon } = BUILDER_TOOLS.find(({ id }) => id === tool)!
  return <Icon />
}
