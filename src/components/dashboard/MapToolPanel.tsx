import { ChevronLeft, ChevronRight } from "lucide-react"
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { Brush } from "@/hooks/use-brush"
import type { StampPlacement } from "@/hooks/use-stamp-placement"
import type { BuilderTool, LandMode, LandTool, PanMode, SelectMode } from "@/lib/map-builder-tools"
import type { SceneBackground } from "@/lib/map-scene"
import { toolSections } from "./map-tool-sections"
import { MapToolSections } from "./MapToolSections"

export type Props = {
  tool: BuilderTool
  open: boolean
  cutting: boolean
  brush: Brush
  background: SceneBackground
  showAssets: boolean
  hasAssets: boolean
  zoom: number
  disabled: boolean
  onOpen: (open: boolean) => void
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

// The docked panel beside the tool strip: the sub tools of the tool in use above,
// its settings below. It lies over the canvas and slides in and out like the
// sidebar does, so the canvas is never resized and the map stays where it is;
// only putting it away by hand closes it, whatever the tool. It is placed against the strip, over
// the whole height of the builder, status bar too, so that its handle reaches the bottom as the
// strip does; it is cut off at the strip as it slides away.
export function MapToolPanel(props: Props) {
  const { open, disabled } = props
  const sections = toolSections(props)

  return (
    <div className="pointer-events-none absolute inset-y-0 left-16 z-20 w-[14.75rem] overflow-hidden">
      <Collapsible
        open={open}
        onOpenChange={props.onOpen}
        className={`pointer-events-auto absolute inset-y-0 left-0 flex transition-transform duration-200 ease-linear motion-reduce:transition-none data-[state=closed]:-translate-x-56 ${disabled ? "pointer-events-none" : ""}`}
      >
        {/* The foot is the account, which lies over it from the tool strip (see MapAccount). */}
        <div inert={!open} className="bg-background w-56 border-r pb-[68px]">
          <MapToolSections sections={sections} />
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <CollapsibleTrigger
              aria-label={open ? "Put the tool panel away" : "Show the tool panel"}
              className="text-muted-foreground bg-background hover:bg-muted flex w-3 items-center border-r outline-none"
            >
              {open ? <ChevronLeft className="size-3" /> : <ChevronRight className="size-3" />}
            </CollapsibleTrigger>
          </TooltipTrigger>
          <TooltipContent side="right">
            {open ? "Hide tool panel" : "Show tool panel"}
          </TooltipContent>
        </Tooltip>
      </Collapsible>
    </div>
  )
}
