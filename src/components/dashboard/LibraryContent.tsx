import type { CSSProperties } from "react"
import { HoverIcon } from "@/components/icons/HoverIcon"
import { PlusIcon } from "@/components/icons/PlusIcon"
import { FormAlert } from "@/components/auth/FormAlert"
import { LoadingGate } from "@/components/LoadingGate"
import { Button } from "@/components/ui/button"
import { useCharacters } from "@/hooks/use-characters"
import { useSrdView } from "@/hooks/use-srd-view"
import type { WorldViewMode } from "@/hooks/use-world-view-mode"
import { CHARACTERS_SECTION, hasGraph } from "@/lib/library-sections"
import { nodeLabel } from "@/lib/library-tree"
import type { Recency } from "@/lib/library-recency"
import { cn } from "@/lib/utils"
import type { FilterGroup } from "./FilterPopover"
import { LibraryAllView } from "./LibraryAllView"
import { LibraryCharacters } from "./LibraryCharacters"
import { LibrarySearch } from "./LibrarySearch"
import { LibraryToolbar } from "./LibraryToolbar"
import { PanelHeader } from "./PanelHeader"
import { SrdResults } from "./SrdResults"
import type { LibraryPageState } from "./useLibraryPage"
import { WorldEntryResults } from "./WorldEntryResults"
import { WorldGridSkeleton } from "./WorldGridSkeleton"

type Props = { page: LibraryPageState; onNewCharacter: () => void }

const RECENCY: FilterGroup = {
  label: "Last changed",
  value: "any",
  options: [
    { value: "any", label: "Any time" },
    { value: "week", label: "7 days" },
    { value: "month", label: "30 days" },
  ],
  onChange: () => {},
}

// What the open node shows, for every node alike: a toolbar (the search scoped to the node, the
// filter, size, list or grid, and New under Yours) above the cards or the list, which scroll.
export function LibraryContent({ page, onNewCharacter }: Props) {
  const { section, nodeId, onSrd, mode, selection } = page
  const { characters } = useCharacters()
  const srd = useSrdView(nodeId, page.query)
  const onCharacters = section.id === CHARACTERS_SECTION.id
  const searching = page.query.trim() !== "" || page.recency !== "any"
  const problem = page.error ?? page.actionError
  const grouped = section.id === "all" && mode === "grid" && !searching
  const modes: WorldViewMode[] = !onSrd && hasGraph(section) ? ["list", "grid", "graph"] : ["list", "grid"]
  const filters = onSrd ? srd.filters : [{ ...RECENCY, value: page.recency, onChange: (value: string) => page.setRecency(value as Recency) }]

  return (
    <div className="flex h-full min-w-0 flex-col">
      <PanelHeader className="h-12 justify-between gap-2 px-3">
        <LibrarySearch query={page.query} onQuery={page.setQuery} placeholder={`Search ${nodeLabel(nodeId).toLowerCase()}`} />
        <div className="flex items-center gap-2">
          {onCharacters ? (
            <Button onClick={onNewCharacter}>
              <HoverIcon icon={PlusIcon} size={16} />
              New character
            </Button>
          ) : (
            <LibraryToolbar
              filters={filters}
              mode={mode}
              onMode={page.setMode}
              modes={modes}
              cardSize={page.cardSize}
              onCardSize={page.setCardSize}
              makes={onSrd ? [] : section.makes}
              onNew={page.make}
            />
          )}
        </div>
      </PanelHeader>
      <div style={{ "--collection-top": "0px" } as CSSProperties} className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-4">
        {problem && <FormAlert tone="error">{problem}</FormAlert>}
        {onSrd ? (
          <SrdResults creatures={srd.creatures} rules={srd.rules} mode={mode} size={page.cardSize} openId={page.item} showTag={!nodeId.startsWith("srd:rules:") || searching} />
        ) : onCharacters ? (
          <LibraryCharacters characters={characters} query={page.query} onNew={onNewCharacter} />
        ) : (
          <LoadingGate loading={!page.entries && !page.error} className="flex min-h-0 flex-1 flex-col" skeleton={<WorldGridSkeleton />}>
            {() =>
              page.shown && (
                <div className={cn("flex flex-1 flex-col", mode === "graph" && "min-h-[28rem] overflow-hidden rounded-lg border")}>
                  {grouped && page.shown.length > 0 ? (
                    <LibraryAllView entries={page.shown} manage={page.manage} selection={selection} size={page.cardSize} onSee={page.setSection} />
                  ) : (
                    <WorldEntryResults
                      entries={page.shown}
                      mode={mode}
                      kind={null}
                      filtered={searching}
                      canManage
                      manage={page.manage}
                      selection={selection}
                      sort={page.sort}
                      onSort={page.setSort}
                      cardSize={page.cardSize}
                      connections={null}
                      wide={section.id === "maps"}
                    />
                  )}
                </div>
              )
            }
          </LoadingGate>
        )}
      </div>
    </div>
  )
}
