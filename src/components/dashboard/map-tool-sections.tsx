import type { BrushLayer } from "@/hooks/use-brush"
import type { Props } from "./MapToolPanel"
import { MapBiomeSubTools } from "./MapBiomeSubTools"
import { MapBrushProperties } from "./MapBrushProperties"
import { MapDetailSubTools } from "./MapDetailSubTools"
import { MapLandSubTools } from "./MapLandSubTools"
import { MapPanProperties } from "./MapPanProperties"
import { MapPanSubTools } from "./MapPanSubTools"
import { MapSelectProperties } from "./MapSelectProperties"
import { MapSelectSubTools } from "./MapSelectSubTools"
import type { ToolSection } from "./MapToolSections"

// What each tool offers, section by section; a tool gets another by adding one here.
export function toolSections(props: Props): ToolSection[] {
  const { tool, cutting, brush, background } = props
  const list: ToolSection[] = []
  if (tool === "land")
    list.push({
      id: "modes",
      title: "Land",
      content: (
        <div className="grid gap-1 p-2">
          <MapLandSubTools cutting={cutting} onMode={props.onMode} />
        </div>
      ),
    })
  if (tool === "brush")
    list.push({
      id: "brushes",
      title: "Brushes",
      tabs: {
        tabs: [
          { id: "biomes", title: "Biomes" },
          { id: "details", title: "Details" },
        ],
        active: brush.layer,
        onPick: (id) => brush.onLayer(id as BrushLayer),
      },
      content: (
        <div className="grid gap-1 p-2">
          {brush.layer === "details" ? (
            <MapDetailSubTools brush={brush} />
          ) : (
            <MapBiomeSubTools brush={brush} background={background} />
          )}
        </div>
      ),
    })
  if (tool === "select")
    list.push({
      id: "modes",
      title: "Selection",
      content: (
        <div className="grid gap-1 p-2">
          <MapSelectSubTools mode={props.selectMode} onMode={props.onSelectMode} />
        </div>
      ),
    })
  if (tool === "hand")
    list.push({
      id: "modes",
      title: "Navigation",
      content: (
        <div className="grid gap-1 p-2">
          <MapPanSubTools mode={props.panMode} onMode={props.onPanMode} />
        </div>
      ),
    })
  list.push({
    id: "properties",
    title: "Tool properties",
    content: (
      <div className="grid gap-4 p-3">
        {tool === "land" && (
          <p className="text-muted-foreground text-xs">Tap Alt to switch between adding and cutting.</p>
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
          <MapPanProperties
            mode={props.panMode}
            zoom={props.zoom}
            onZoom={props.onZoom}
            onFit={props.onFit}
          />
        )}
      </div>
    ),
  })
  return list
}
