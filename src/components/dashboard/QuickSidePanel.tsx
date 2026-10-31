import { useState } from "react"
import type { ComponentProps, ReactNode } from "react"
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { useStoredTab } from "@/hooks/use-stored-tab"
import type { CardModel } from "@/lib/quick-card"
import { MapPanelHandle } from "./MapPanelHandle"
import { MapPanelHeader, MapPanelTab, PANEL_SCROLL } from "./MapPanelHeader"
import { QuickFeaturesTab } from "./QuickFeaturesTab"
import { QuickGearTab } from "./QuickGearTab"
import { QuickProficienciesTab } from "./QuickProficienciesTab"

// Where the divider starts, so that the portrait is as large as the panel allows: the panel is 360
// wide, so a 335 square (12 of padding a side), 8 of gap, 32 of name and 12 of padding below it, and
// the 12 above.
const PORTRAIT_START = 400

type Split = NonNullable<ComponentProps<typeof ResizablePanelGroup>["defaultLayout"]>

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "features", label: "Features" },
  { id: "proficiencies", label: "Proficiencies" },
  { id: "gear", label: "Gear" },
] as const

type Props = {
  // The Overview's two parts, with a divider between them: the portrait and the name, and the numbers.
  overviewTop: ReactNode
  overviewBottom: ReactNode
  shown: CardModel
  base: CardModel
  // Opens a pick's panel; none until the class, species and background are chosen.
  onPick: ((pick: string) => void) | null
  // Opens the picker of a word of the sentence.
  onOpenSlot: (slot: string) => void
  // Gives a pick of the player's back to the suggestion; none until there are suggestions.
  onReset: ((field: string, label: string) => void) | null
}

// The panel on the right, as the map builder's: a flat bar of tabs on a shade apart that stays
// put, and the open tab under it, scrolling on its own. The tab is remembered in this browser.
export function QuickSidePanel({ overviewTop, overviewBottom, shown, base, onPick, onOpenSlot, onReset }: Props) {
  // Where the divider was pulled to is kept while the page is open, through the other tabs, and not
  // after a reload, which starts with the portrait as large as it can be.
  const [split, setSplit] = useState<Split | undefined>(undefined)
  const [tab, setTab] = useStoredTab("quick-panel-tab", TABS.map((candidate) => candidate.id))
  const content: Record<Exclude<(typeof TABS)[number]["id"], "overview">, ReactNode> = {
    features: <QuickFeaturesTab shown={shown} base={base} onPick={onPick} onOpenSlot={onOpenSlot} onReset={onReset} />,
    proficiencies: <QuickProficienciesTab shown={shown} base={base} onPick={onPick} onReset={onReset} />,
    gear: <QuickGearTab shown={shown} base={base} onPick={onPick} onReset={onReset} />,
  }

  return (
    <aside aria-label="Your character" className="flex w-[360px] shrink-0 flex-col border-l">
      <Tabs value={tab} onValueChange={setTab} className="min-h-0 flex-1 gap-0">
        <MapPanelHeader fill>
          {TABS.map((candidate) => (
            <MapPanelTab key={candidate.id} value={candidate.id} className="flex-1 last:border-r-0">{candidate.label}</MapPanelTab>
          ))}
        </MapPanelHeader>
        {/* The portrait is as large a square as its part allows, so pulling the divider makes it smaller or
            larger and it keeps its shape. The numbers under it scroll on their own. */}
        <TabsContent value="overview" className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <ResizablePanelGroup orientation="vertical" defaultLayout={split} onLayoutChanged={setSplit}>
            <ResizablePanel id="portrait" defaultSize={PORTRAIT_START} minSize={240} maxSize="80%" groupResizeBehavior="preserve-pixel-size" className="flex flex-col" style={{ overflow: "hidden" }}>
              {overviewTop}
            </ResizablePanel>
            <MapPanelHandle />
            <ResizablePanel id="numbers" minSize={140} className="flex flex-col" style={{ overflow: "hidden" }}>
              <div className={PANEL_SCROLL}>
                <div className="p-4 pr-2 pt-2">{overviewBottom}</div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </TabsContent>
        {(Object.keys(content) as (keyof typeof content)[]).map((id) => (
          <TabsContent key={id} value={id} className={PANEL_SCROLL}>
            <div className="p-4 pr-2">{content[id]}</div>
          </TabsContent>
        ))}
      </Tabs>
    </aside>
  )
}
