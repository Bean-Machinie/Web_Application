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
import { MapPanelHeader, MapPanelTab } from "./MapPanelHeader"
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
// above, the library below. Each group scrolls on its own.
export function MapRightPanel(props: Props) {
  const { scene, editing, terrain, viewport, settings, armed, onArm, disabled } = props
  const layout = useRightPanelLayout()
  const [tileSize, setTileSize] = useAssetTileSize()
  const selected = scene.assets.some((asset) => editing.selected.includes(asset.id))
  const [tab, pick] = useSelectionTab(selected)

  return (
    <aside className="flex w-72 shrink-0 flex-col border-l">
      <ResizablePanelGroup
        orientation="vertical"
        defaultLayout={layout.defaultLayout}
        onLayoutChanged={layout.onLayoutChanged}
      >
        <ResizablePanel id="top" defaultSize="45%" minSize="20%">
          <Tabs value={tab} onValueChange={(next) => pick(next as RightTab)} className="gap-0">
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
            <div className={disabled ? "pointer-events-none opacity-60" : undefined}>
              <TabsContent value="map" className="grid gap-4 p-4">
                {settings}
              </TabsContent>
              <TabsContent value="properties" className="p-4">
                <MapProperties assets={scene.assets} editing={editing} />
              </TabsContent>
              <TabsContent value="navigator" className="p-4">
                <MapNavigator scene={scene} terrain={terrain} viewport={viewport} />
              </TabsContent>
            </div>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle
          withHandle
          className="bg-black/10 aria-[orientation=horizontal]:h-2 dark:bg-black/40 border-y data-[separator=active]:[&>div]:bg-foreground/80 data-[separator=hover]:[&>div]:bg-foreground/60 [&>div]:bg-muted-foreground/40 [&>div]:transition-colors"
        />
        <ResizablePanel id="library" defaultSize="55%" minSize="20%">
          <Tabs value="assets" className="gap-0">
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
            <TabsContent value="assets">
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
