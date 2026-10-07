import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { AssetEditing } from "@/hooks/use-asset-editing"
import { useRightPanelLayout } from "@/hooks/use-right-panel-layout"
import { useSelectionTab } from "@/hooks/use-selection-tab"
import type { RightTab } from "@/hooks/use-selection-tab"
import type { PlacedAsset } from "@/lib/map-scene"
import { MapAssetPanel } from "./MapAssetPanel"
import { MapProperties } from "./MapProperties"

type Props = {
  assets: PlacedAsset[]
  editing: AssetEditing
  // The map's settings, for the Map tab.
  settings: React.ReactNode
  armed: string | null
  onArm: (id: string) => void
  viewScale: number
  disabled: boolean
}

// The panel on the right, as two groups with a border between them that can be
// dragged: tabs for the map and for what is selected above, the library below.
// Each group scrolls on its own.
export function MapRightPanel({ assets, editing, settings, armed, onArm, viewScale, disabled }: Props) {
  const layout = useRightPanelLayout()
  const selected = assets.some((asset) => editing.selected.includes(asset.id))
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
            <div className="bg-background sticky top-0 z-10 p-2">
              <TabsList className="w-full">
                <TabsTrigger value="map" className="text-xs">
                  Map
                </TabsTrigger>
                <TabsTrigger value="properties" className="text-xs">
                  Properties
                </TabsTrigger>
              </TabsList>
            </div>
            <div className={disabled ? "pointer-events-none opacity-60" : undefined}>
              <TabsContent value="map" className="grid gap-4 px-4 pt-1 pb-4">
                {settings}
              </TabsContent>
              <TabsContent value="properties" className="px-4 pt-1 pb-4">
                <MapProperties assets={assets} editing={editing} />
              </TabsContent>
            </div>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle className="data-[separator=active]:bg-foreground/30 data-[separator=hover]:bg-foreground/20" />
        <ResizablePanel id="library" defaultSize="55%" minSize="20%">
          <MapAssetPanel
            armed={armed}
            onArm={onArm}
            viewScale={viewScale}
            disabled={disabled}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </aside>
  )
}
