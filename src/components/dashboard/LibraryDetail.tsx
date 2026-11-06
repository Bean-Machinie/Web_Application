import { useEffect } from "react"
import { Link } from "react-router-dom"
import { ArrowUpRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { isTyping } from "@/lib/entry-selection"
import { monsterById } from "@/lib/compendium-monsters"
import { ruleEntry } from "@/lib/rules-terms"
import { srdPath } from "@/lib/srd-paths"
import { srdSectionOf } from "@/lib/srd-items"
import { AddMonsterButton } from "./AddMonsterButton"
import { LibraryDetailBody } from "./LibraryDetailBody"
import { LibraryPanel } from "./LibraryPanel"
import type { LibraryPageState } from "./useLibraryPage"
import { useWorldScope } from "./useWorldScope"

// The panel at the right of the library: whatever was clicked, read (or, in Yours, edited) beside the
// list. Its header has the name, the way to the item's own page, Add to campaign where it applies,
// and a close button; Escape closes it too. No box is drawn inside it.
export function LibraryDetail({ page }: { page: LibraryPageState }) {
  const { nodeId, item, onSrd, setItem } = page
  const { basePath } = useWorldScope()
  const section = srdSectionOf(nodeId)
  const entry = !onSrd ? page.entries?.find((candidate) => candidate.id === item) : undefined
  const monster = onSrd && section === "creatures" ? monsterById(item ?? undefined) : undefined
  const rule = onSrd && section === "rules" ? ruleEntry(item ?? undefined) : undefined
  const title = entry?.name ?? monster?.name ?? rule?.title ?? ""
  const fullPage = item && (onSrd ? srdPath(section, item) : `${basePath}/${item}`)

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape" || event.defaultPrevented || isTyping(event.target)) return
      // A dialog or menu is open over the panel: Escape is for that.
      if (document.querySelector("[role=dialog], [role=menu], [data-radix-popper-content-wrapper]")) return
      // Picked entries are let go of first.
      if (page.selection.active) return
      setItem(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [setItem, page.selection.active])

  return (
    <LibraryPanel>
      <div className="flex h-full flex-col">
        <div className="flex h-12 shrink-0 items-center gap-2 pr-2 pl-4">
          <h2 className="min-w-0 flex-1 truncate font-semibold">{title}</h2>
          {fullPage && (
            <Button asChild variant="ghost" size="sm">
              <Link to={fullPage}>
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
          <Button variant="ghost" size="icon-sm" aria-label="Close" onClick={() => setItem(null)}>
            <X />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
          {item && <LibraryDetailBody itemId={item} monster={monster} rule={rule} onSrd={onSrd} onSelectRule={setItem} />}
        </div>
      </div>
    </LibraryPanel>
  )
}
