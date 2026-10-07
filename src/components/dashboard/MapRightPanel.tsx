import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { AssetEditing } from "@/hooks/use-asset-editing"
import { useAssetTileSize } from "@/hooks/use-asset-tile-size"
import type { useBuilderViewport } from "@/hooks/use-builder-viewport"
import { useRightPanelLayout } from "@/hooks/use-right-panel-layout"
import { useSelectionTab } from "@/hooks/use-selection-tab"
import type { RightTab } from "@/hooks/use-selection-tab"
import type { MapScene } from "@/lib/map-scene"
import type { Terrain } from "@/lib/terrain"
import { MapAssetPanel } from "./MapAssetPanel"
import { MapNavigator } from "./MapNavigator"
import { MapPanelHeader, MapPanelTab, PANEL_SCROLL } from "./MapPanelHeader"
import { MapProperties } from "./MapProperties"
import { MapTileSize } from "./MapTileSize"

type Props = {
  scene: MapScene
  editing: AssetEditing
  terrain: Terrain | null
  viewport: ReturnType<typeof useBuilderViewport>
  // The map's settings, for the Map tab.
  settings: React.ReactNode
  armed: string | null
  onArm: (id: string) => void
  disabled: boolean
}

// The panel on the right, as two groups, each with a bar of tabs and a gutter
// between them that can be dragged: the map, what is selected and the navigator
// above, the library below. Each group scrolls on its own, under its bar.
export function MapRightPanel(props: Props) {
  const { scene, editing, terrain, viewport, settings, armed, onArm, disabled } = props
  const layout = useRightPanelLayout()
  const [tileSize, setTileSize] = useAssetTileSize()
  const selected = scene.assets.some((asset) => editing.selected.includes(asset.id))
  const [tab, pick] = useSelectionTab(selected)
  const locked = disabled ? "pointer-events-none opacity-60" : ""

  return (
    <aside className="flex w-72 shrink-0 flex-col border-l">
      <ResizablePanelGroup
        orientation="vertical"
        defaultLayout={layout.defaultLayout}
        onLayoutChanged={layout.onLayoutChanged}
      >
        {/* The least that keeps the navigator's zoom controls in view; and when the
            window is resized it is the library that gives or takes the room. */}
        <ResizablePanel
          id="top"
          defaultSize="45%"
          minSize={176}
          groupResizeBehavior="preserve-pixel-size"
          className="flex flex-col"
          style={{ overflow: "hidden" }}
        >
          <Tabs value={tab} onValueChange={(next) => pick(next as RightTab)} className="min-h-0 flex-1 gap-0">
            <MapPanelHeader fill>
              <MapPanelTab value="navigator" className="flex-1">
                Navigator
              </MapPanelTab>
              <MapPanelTab value="map" className="flex-1">
                Map
              </MapPanelTab>
              <MapPanelTab value="properties" className="flex-1 last:border-r-0">
                Properties
              </MapPanelTab>
            </MapPanelHeader>
            <TabsContent value="map" className={`${PANEL_SCROLL} ${locked}`}>
              <div className="grid gap-4 p-4 pr-2">{settings}</div>
            </TabsContent>
            <TabsContent value="properties" className={`${PANEL_SCROLL} ${locked}`}>
              <div className="p-4 pr-2">
                <MapProperties assets={scene.assets} editing={editing} />
              </div>
            </TabsContent>
            <TabsContent value="navigator" className={`flex flex-col overflow-hidden p-3 ${locked}`}>
              <MapNavigator scene={scene} terrain={terrain} viewport={viewport} />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle
          withHandle
          className="bg-black/10 aria-[orientation=horizontal]:h-2 dark:bg-black/40 border-y data-[separator=active]:[&>div]:bg-foreground/80 data-[separator=hover]:[&>div]:bg-foreground/60 [&>div]:bg-muted-foreground/40 [&>div]:transition-colors"
        />
        <ResizablePanel id="library" defaultSize="55%" minSize="20%" className="flex flex-col" style={{ overflow: "hidden" }}>
          <Tabs value="assets" className="min-h-0 flex-1 gap-0">
            <MapPanelHeader end={<MapTileSize size={tileSize} onSize={setTileSize} />}>
              <Tooltip>
                {/* The tooltip has a state of its own, which the tab must not be given. */}
                <TooltipTrigger asChild>
                  <span className="flex h-full">
                    <MapPanelTab value="assets">Assets</MapPanelTab>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Click to pick, or drag onto the map</TooltipContent>
              </Tooltip>
            </MapPanelHeader>
            <TabsContent value="assets" className={PANEL_SCROLL}>
              <MapAssetPanel
                armed={armed}
                onArm={onArm}
                tileSize={tileSize}
                viewScale={viewport.view.scale}
                disabled={disabled}
              />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </aside>
  )
}
