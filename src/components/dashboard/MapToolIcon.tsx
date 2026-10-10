import { Lasso, RotateCw, SquareDashed } from "lucide-react"
import { BUILDER_TOOLS } from "@/lib/map-builder-tools"
import type { BuilderTool, LandMode, PanMode, SelectMode } from "@/lib/map-builder-tools"
import { MapLandIcon } from "./MapLandIcon"

export type ToolModes = { land: LandMode; select: SelectMode; hand: PanMode }

// The icon of a tool in the strip: the one of its sub tool in use, as Clip Studio
// does. The biome brush keeps its own, as each biome is a stroke of its own.
export function MapToolIcon({ tool, modes }: { tool: BuilderTool; modes: ToolModes }) {
  if (tool === "land") return <MapLandIcon cut={modes.land === "cut"} />
  if (tool === "select") return modes.select === "lasso" ? <Lasso /> : <SquareDashed />
  if (tool === "hand" && modes.hand === "rotate") return <RotateCw />
  const { Icon } = BUILDER_TOOLS.find(({ id }) => id === tool)!
  return <Icon />
}
