import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { Brush } from "@/hooks/use-brush"
import { BUILDER_TOOLS, toolHasSettings } from "@/lib/map-builder-tools"
import type { BuilderTool, LandMode } from "@/lib/map-builder-tools"
import type { SceneBackground } from "@/lib/map-scene"
import { MapBiomeSubTools } from "./MapBiomeSubTools"
import { MapBrushProperties } from "./MapBrushProperties"
import { MapLandSubTools } from "./MapLandSubTools"

type Props = {
  tool: BuilderTool
  cutting: boolean
  brush: Brush
  background: SceneBackground
  showAssets: boolean
  disabled: boolean
  onMode: (mode: LandMode) => void
  onShowAssets: (show: boolean) => void
}

const Heading = ({ children }: { children: string }) => (
  <h3 className="text-muted-foreground px-1 text-xs">{children}</h3>
)

// The docked panel beside the tool strip: the sub tools of the tool in use above,
// its settings below. It is closed for tools with nothing to set, and opens again
// for the others unless it was put away by hand.
export function MapToolPanel(props: Props) {
  const { tool, cutting, brush, background, showAssets, disabled } = props
  const [putAway, setPutAway] = useState(false)
  const open = toolHasSettings(tool) && !putAway
  const label = BUILDER_TOOLS.find(({ id }) => id === tool)?.label

  return (
    <Collapsible
      open={open}
      onOpenChange={(next) => setPutAway(!next)}
      className={`flex shrink-0 ${disabled ? "pointer-events-none opacity-60" : ""}`}
    >
      <CollapsibleContent className="flex w-56 flex-col overflow-y-auto border-r">
        <h2 className="flex h-9 shrink-0 items-center border-b px-3 text-sm font-medium">{label}</h2>
        {tool !== "blend" && (
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
          {tool !== "land" && (
            <MapBrushProperties
              blending={tool === "blend"}
              brush={brush}
              showAssets={showAssets}
              onShowAssets={props.onShowAssets}
            />
          )}
        </section>
      </CollapsibleContent>
      {toolHasSettings(tool) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <CollapsibleTrigger
              aria-label={open ? "Put the tool panel away" : "Show the tool panel"}
              className="text-muted-foreground hover:bg-muted flex w-3 items-center border-r outline-none"
            >
              {open ? <ChevronLeft className="size-3" /> : <ChevronRight className="size-3" />}
            </CollapsibleTrigger>
          </TooltipTrigger>
          <TooltipContent side="right">{open ? "Put the tool panel away" : "Show the tool panel"}</TooltipContent>
        </Tooltip>
      )}
    </Collapsible>
  )
}
