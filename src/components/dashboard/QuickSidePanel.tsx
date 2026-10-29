import type { ReactNode } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { MapPanelHeader, MapPanelTab, PANEL_SCROLL } from "./MapPanelHeader"

// The panel on the right, as the map builder's: a flat bar of tabs on a shade apart, and the
// character under it, scrolling on its own.
export function QuickSidePanel({ children }: { children: ReactNode }) {
  return (
    <aside aria-label="Your character" className="flex w-[360px] shrink-0 flex-col border-l">
      <Tabs value="character" className="min-h-0 flex-1 gap-0">
        <MapPanelHeader>
          <MapPanelTab value="character">Character</MapPanelTab>
        </MapPanelHeader>
        <TabsContent value="character" className={PANEL_SCROLL}>
          <div className="p-4 pr-2">{children}</div>
        </TabsContent>
      </Tabs>
    </aside>
  )
}
