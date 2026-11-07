import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useFlashText } from "@/hooks/use-flash-text"
import { isTyping } from "@/lib/entry-selection"
import { cn } from "@/lib/utils"
import { QUIET_SCROLL } from "@/lib/quiet-scroll"
import type { WorldEntry } from "@/lib/world-entries"
import { AddMonsterButton } from "./AddMonsterButton"
import { DetailTabList } from "./DetailTabList"
import { LibraryDetailBody } from "./LibraryDetailBody"
import { describeLibraryTab } from "./libraryDetailTab"
import { PanelHeader } from "./PanelHeader"
import type { LibraryTabsState } from "./useLibraryTabs"
import { useWorldScope } from "./useWorldScope"

// The panel at the right of the library, laid out as a journal pane: its tabs on top, with the way
// to the showing item's own page and Add to campaign beside them, and the item read (or, in
// Yours, edited) below. Escape closes the tab showing.
type Props = {
  tabs: LibraryTabsState
  entries: WorldEntry[] | null
  // Picked entries are let go of first by Escape.
  selecting: boolean
  // Where entries can be added to a campaign (the library); absent elsewhere.
  onAddToCampaign?: (entry: WorldEntry) => void
}

export function LibraryDetail({ tabs, entries, selecting, onAddToCampaign }: Props) {
  const { basePath } = useWorldScope()
  const active = tabs.activeTab
  const [scrolled, setScrolled] = useState(false)
  const showingKey = active ? `${active.kind}:${active.id}` : "none"
  useEffect(() => setScrolled(false), [showingKey])
  const body = useRef<HTMLDivElement>(null)
  useFlashText(body, tabs.flash, showingKey)
  const showing = active && describeLibraryTab(active, entries, basePath)
  const entry = showing && "entry" in showing ? showing.entry : undefined
  const monster = showing && "monster" in showing ? showing.monster : undefined
  const rule = showing && "rule" in showing ? showing.rule : undefined

  const last = active?.trail?.at(-1)
  const previous = last && describeLibraryTab(last, entries, basePath)
  const back = previous && { title: previous.title, go: tabs.back }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape" || event.defaultPrevented || isTyping(event.target)) return
      // A dialog or menu is open over the panel: Escape is for that.
      if (document.querySelector("[role=dialog], [role=menu], [data-radix-popper-content-wrapper]")) return
      // Picked entries are let go of first.
      if (selecting) return
      tabs.close(tabs.active)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [tabs, selecting])

  return (
    <div className="bg-background flex h-full flex-col">
      <PanelHeader
        className={cn(
          // As the journal's strip: in the dark theme the tab showing sits right over the page, and
          // the line under the bar shows only once the page has gone up.
          "h-12 items-stretch gap-0 px-0 transition-colors duration-150 dark:border-b-0",
          !scrolled && "border-b-transparent"
        )}
      >
        <DetailTabList tabs={tabs} entries={entries} basePath={basePath} />
        <div className="flex shrink-0 items-center gap-1 px-1.5">
          {showing?.fullPage && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild variant="ghost" size="icon-sm" className="shrink-0">
                  <Link to={showing.fullPage} aria-label="Open full page">
                    <ArrowUpRight />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open full page</TooltipContent>
            </Tooltip>
          )}
          {monster && <AddMonsterButton monster={monster} />}
          {entry && onAddToCampaign && (
            <Button size="sm" onClick={() => onAddToCampaign(entry)}>
              Add to campaign
            </Button>
          )}
        </div>
      </PanelHeader>
      <div className="relative min-h-0 flex-1">
        <div key={showingKey} ref={body} onScroll={(event) => setScrolled(event.currentTarget.scrollTop > 0)} className={`${QUIET_SCROLL} h-full overflow-y-auto p-4 pb-6`}>
          {active && <LibraryDetailBody tab={active} monster={monster} rule={rule} onSelectRule={tabs.openRule} back={back} />}
        </div>
        {/* The shadow that falls from under the tabs once the page has gone up, as in the journal. */}
        <div
          aria-hidden
          className={cn("pointer-events-none absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-black/30 to-transparent transition-opacity duration-150", scrolled ? "opacity-100" : "opacity-0")}
        />
      </div>
    </div>
  )
}
