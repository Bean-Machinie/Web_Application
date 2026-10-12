import type { BrushLayer } from "@/hooks/use-brush"
import { BUILDER_TOOLS } from "@/lib/map-builder-tools"
import type { LandTool } from "@/lib/map-builder-tools"
import { helpFor } from "@/lib/map-help"
import type { Props } from "./MapToolPanel"
import { MapBiomeSubTools } from "./MapBiomeSubTools"
import { MapBrushProperties } from "./MapBrushProperties"
import { MapBlendSubTools } from "./MapBlendSubTools"
import { MapDetailSubTools } from "./MapDetailSubTools"
import { MapEraseSubTools } from "./MapEraseSubTools"
import { MapHelpButton } from "./MapHelpButton"
import { MapLandProperties } from "./MapLandProperties"
import { MapLassoSubTools } from "./MapLassoSubTools"
import { MapPanProperties } from "./MapPanProperties"
import { MapPanSubTools } from "./MapPanSubTools"
import { MapSelectProperties } from "./MapSelectProperties"
import { MapSelectSubTools } from "./MapSelectSubTools"
import { MapShapeSubTools } from "./MapShapeSubTools"
import type { ToolSection } from "./MapToolSections"

const toolLabel = (tool: string) => BUILDER_TOOLS.find(({ id }) => id === tool)?.label ?? "Tool"

// What each tool offers, section by section; a tool gets another by adding one here. The
// first is always "main" and the last "properties", for the panel to keep their sizes.
export function toolSections(props: Props): ToolSection[] {
  const { tool, cutting, brush, background } = props
  const list: ToolSection[] = []
  if (tool === "land")
    list.push({
      id: "main",
      title: "Land",
      fillTabs: true,
      tabs: {
        tabs: [
          { id: "lasso", title: "Lasso" },
          { id: "shapes", title: "Shapes" },
          { id: "islands", title: "Islands" },
        ],
        active: props.landTool,
        onPick: (id) => props.onLandTool(id as LandTool),
      },
      content: (
        <div className="grid gap-1 p-2">
          {props.landTool === "lasso" ? (
            <MapLassoSubTools cutting={cutting} />
          ) : (
            <MapShapeSubTools
              group={props.landTool === "islands" ? "islands" : "basic"}
              stampId={props.stampId}
              onStamp={props.onStamp}
            />
          )}
        </div>
      ),
    })
  if (tool === "brush")
    list.push({
      id: "main",
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
            <MapDetailSubTools brush={brush} background={background} />
          ) : (
            <MapBiomeSubTools brush={brush} background={background} />
          )}
        </div>
      ),
    })
  if (tool === "blend")
    list.push({
      id: "main",
      title: "Blend brush",
      content: (
        <div className="grid gap-1 p-2">
          <MapBlendSubTools />
        </div>
      ),
    })
  if (tool === "eraser")
    list.push({
      id: "main",
      title: "Eraser",
      content: (
        <div className="grid gap-1 p-2">
          <MapEraseSubTools brush={brush} />
        </div>
      ),
    })
  if (tool === "select")
    list.push({
      id: "main",
      title: "Selection",
      content: (
        <div className="grid gap-1 p-2">
          <MapSelectSubTools mode={props.selectMode} onMode={props.onSelectMode} />
        </div>
      ),
    })
  if (tool === "hand")
    list.push({
      id: "main",
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
    end: <MapHelpButton title={`${toolLabel(tool)} help`} rows={helpFor(tool, props.landTool, props.panMode)} />,
    content: (
      <div className="grid gap-4 p-3">
        {tool === "land" && (
          <MapLandProperties
            landTool={props.landTool}
            cutting={cutting}
            onMode={props.onMode}
            placement={props.placement}
            stampId={props.stampId}
          />
        )}
        {(tool === "brush" || tool === "eraser" || tool === "blend") && (
          <MapBrushProperties
            blending={tool === "blend"}
            erasing={tool === "eraser" ? brush.erase : null}
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
