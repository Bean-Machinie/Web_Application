import type { Brush } from "@/hooks/use-brush"
import type { StampPlacement } from "@/hooks/use-stamp-placement"
import type { BuilderTool, LandMode, LandTool, PanMode, SelectMode } from "@/lib/map-builder-tools"
import type { SceneBackground } from "@/lib/map-scene"
import { toolSections } from "./map-tool-sections"
import { MapToolSections } from "./MapToolSections"

export type Props = {
  tool: BuilderTool
  cutting: boolean
  brush: Brush
  background: SceneBackground
  showAssets: boolean
  hasAssets: boolean
  zoom: number
  onMode: (mode: LandMode) => void
  landTool: LandTool
  onLandTool: (tool: LandTool) => void
  stampId: string
  onStamp: (id: string) => void
  placement: StampPlacement
  selectMode: SelectMode
  onSelectMode: (mode: SelectMode) => void
  panMode: PanMode
  onPanMode: (mode: PanMode) => void
  onShowAssets: (show: boolean) => void
  onSelectAll: () => void
  onZoom: (scale: number) => void
  onFit: () => void
}

// What the builder's left panel holds: the sub tools of the tool in use above, its settings
// below. The panel itself, which slides in and out, is the shell's (see BuilderLeftPanel).
export function MapToolPanel(props: Props) {
  return <MapToolSections sections={toolSections(props)} />
}
