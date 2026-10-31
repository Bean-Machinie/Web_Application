import type { ReactNode } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { useStoredTab } from "@/hooks/use-stored-tab"
import type { CardModel } from "@/lib/quick-card"
import { MapPanelHeader, MapPanelTab, PANEL_SCROLL } from "./MapPanelHeader"
import { QuickFeaturesTab } from "./QuickFeaturesTab"
import { QuickGearTab } from "./QuickGearTab"
import { QuickProficienciesTab } from "./QuickProficienciesTab"

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "features", label: "Features" },
  { id: "proficiencies", label: "Proficiencies" },
  { id: "gear", label: "Gear" },
] as const

type Props = {
  // The character card, which is the Overview.
  overview: ReactNode
  shown: CardModel
  base: CardModel
  // Opens a pick's panel; none until the class, species and background are chosen.
  onPick: ((pick: string) => void) | null
  // Opens the picker of a word of the sentence.
  onOpenSlot: (slot: string) => void
}

// The panel on the right, as the map builder's: a flat bar of tabs on a shade apart that stays
// put, and the open tab under it, scrolling on its own. The tab is remembered in this browser.
export function QuickSidePanel({ overview, shown, base, onPick, onOpenSlot }: Props) {
  const [tab, setTab] = useStoredTab("quick-panel-tab", TABS.map((candidate) => candidate.id))
  const content: Record<(typeof TABS)[number]["id"], ReactNode> = {
    overview,
    features: <QuickFeaturesTab shown={shown} base={base} onPick={onPick} onOpenSlot={onOpenSlot} />,
    proficiencies: <QuickProficienciesTab shown={shown} base={base} onPick={onPick} />,
    gear: <QuickGearTab shown={shown} base={base} onPick={onPick} />,
  }

  return (
    <aside aria-label="Your character" className="flex w-[360px] shrink-0 flex-col border-l">
      <Tabs value={tab} onValueChange={setTab} className="min-h-0 flex-1 gap-0">
        <MapPanelHeader>
          {TABS.map((candidate) => (
            <MapPanelTab key={candidate.id} value={candidate.id}>{candidate.label}</MapPanelTab>
          ))}
        </MapPanelHeader>
        {TABS.map((candidate) => (
          <TabsContent key={candidate.id} value={candidate.id} className={PANEL_SCROLL}>
            <div className="p-4 pr-2">{content[candidate.id]}</div>
          </TabsContent>
        ))}
      </Tabs>
    </aside>
  )
}
