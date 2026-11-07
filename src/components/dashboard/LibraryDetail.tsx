import { useEffect } from "react"
import { Link } from "react-router-dom"
import { ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { isTyping } from "@/lib/entry-selection"
import { AddMonsterButton } from "./AddMonsterButton"
import { DetailTab } from "./DetailTab"
import { LibraryDetailBody } from "./LibraryDetailBody"
import { describeLibraryTab } from "./libraryDetailTab"
import { PanelHeader } from "./PanelHeader"
import type { LibraryPageState } from "./useLibraryPage"
import { useWorldScope } from "./useWorldScope"

// The panel at the right of the library, laid out as a journal pane: its tabs on top, with the way
// to the showing item's own page and Add to campaign beside them, and the item read (or, in
// Yours, edited) below. Escape closes the tab showing.
export function LibraryDetail({ page }: { page: LibraryPageState }) {
  const { tabs } = page
  const { basePath } = useWorldScope()
  const active = tabs.activeTab
  const showing = active && describeLibraryTab(active, page.entries, basePath)
  const entry = showing && "entry" in showing ? showing.entry : undefined
  const monster = showing && "monster" in showing ? showing.monster : undefined
  const rule = showing && "rule" in showing ? showing.rule : undefined

  const last = active?.trail?.at(-1)
  const previous = last && describeLibraryTab(last, page.entries, basePath)
  const back = previous && { title: previous.title, go: tabs.back }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape" || event.defaultPrevented || isTyping(event.target)) return
      // A dialog or menu is open over the panel: Escape is for that.
      if (document.querySelector("[role=dialog], [role=menu], [data-radix-popper-content-wrapper]")) return
      // Picked entries are let go of first.
      if (page.selection.active) return
      tabs.close(tabs.active)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [tabs, page.selection.active])

  return (
    <div className="bg-background flex h-full flex-col">
      <PanelHeader className="h-12 items-stretch gap-0 px-0">
        <div role="tablist" className="flex min-w-0 flex-1 items-stretch overflow-x-auto [scrollbar-width:none]">
          {tabs.tabs.map((tab, index) => {
            const label = describeLibraryTab(tab, page.entries, basePath)
            return <DetailTab key={`${tab.kind}:${tab.id}`} icon={label.icon} title={label.title} active={index === tabs.active} onShow={() => tabs.show(index)} onClose={() => tabs.close(index)} />
          })}
        </div>
        <div className="flex shrink-0 items-center gap-1 px-1.5">
          {showing && (
            <Button asChild variant="ghost" size="sm">
              <Link to={showing.fullPage}>
                Open full page
                <ArrowUpRight />
              </Link>
            </Button>
          )}
          {monster && <AddMonsterButton monster={monster} />}
          {entry && (
            <Button size="sm" onClick={() => page.addTo.open([entry])}>
              Add to campaign
            </Button>
          )}
        </div>
      </PanelHeader>
      <div key={active ? `${active.kind}:${active.id}` : "none"} className="min-h-0 flex-1 overflow-y-auto p-4 pb-6">
        {active && <LibraryDetailBody tab={active} monster={monster} rule={rule} onSelectRule={tabs.openRule} back={back} />}
      </div>
    </div>
  )
}
