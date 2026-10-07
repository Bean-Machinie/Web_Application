import { ChevronLeft, ChevronRight } from "lucide-react"
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { Brush } from "@/hooks/use-brush"
import { BUILDER_TOOLS } from "@/lib/map-builder-tools"
import type { BuilderTool, LandMode } from "@/lib/map-builder-tools"
import type { SceneBackground } from "@/lib/map-scene"
import { MapBiomeSubTools } from "./MapBiomeSubTools"
import { MapBrushProperties } from "./MapBrushProperties"
import { MapLandSubTools } from "./MapLandSubTools"
import { MapPanProperties } from "./MapPanProperties"
import { MapSelectProperties } from "./MapSelectProperties"

type Props = {
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
  onShowAssets: (show: boolean) => void
  onSelectAll: () => void
  onZoom: (scale: number) => void
  onFit: () => void
}

const Heading = ({ children }: { children: string }) => (
  <h3 className="text-muted-foreground px-1 text-xs">{children}</h3>
)

// The docked panel beside the tool strip: the sub tools of the tool in use above,
// its settings below. It lies over the canvas and slides in and out like the
// sidebar does, so the canvas is never resized and the map stays where it is;
// only putting it away by hand closes it, whatever the tool.
export function MapToolPanel(props: Props) {
  const { tool, open, cutting, brush, background, disabled } = props
  const label = BUILDER_TOOLS.find(({ id }) => id === tool)?.label
  const hasSubTools = tool === "land" || tool === "brush"

  return (
    <Collapsible
      open={open}
      onOpenChange={props.onOpen}
      className={`absolute inset-y-0 left-0 z-20 flex transition-transform duration-200 ease-linear motion-reduce:transition-none data-[state=closed]:-translate-x-56 ${disabled ? "pointer-events-none opacity-60" : ""}`}
    >
      <div inert={!open} className="bg-background flex w-56 flex-col overflow-y-auto border-r">
        <h2 className="flex h-9 shrink-0 items-center border-b px-3 text-sm font-medium">{label}</h2>
        {hasSubTools && (
          <>
            <section className="grid gap-1 p-2">
              <Heading>Sub tool</Heading>
              {tool === "land" && <MapLandSubTools cutting={cutting} onMode={props.onMode} />}
              {tool === "brush" && <MapBiomeSubTools brush={brush} background={background} />}
            </section>
            <Separator />
          </>
        )}
        <section className="grid gap-4 p-3">
          <Heading>Tool properties</Heading>
          {tool === "land" && (
            <p className="text-muted-foreground text-xs">
              Hold Alt to switch between adding and cutting.
            </p>
          )}
          {(tool === "brush" || tool === "blend") && (
            <MapBrushProperties
              blending={tool === "blend"}
              brush={brush}
              showAssets={props.showAssets}
              onShowAssets={props.onShowAssets}
            />
          )}
          {tool === "select" && (
            <MapSelectProperties hasAssets={props.hasAssets} onSelectAll={props.onSelectAll} />
          )}
          {tool === "hand" && (
            <MapPanProperties zoom={props.zoom} onZoom={props.onZoom} onFit={props.onFit} />
          )}
        </section>
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
        <TooltipContent side="right">{open ? "Put the tool panel away" : "Show the tool panel"}</TooltipContent>
      </Tooltip>
    </Collapsible>
  )
}
