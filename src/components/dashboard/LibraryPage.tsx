import { Plus } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { LoadingGate } from "@/components/LoadingGate"
import { Button } from "@/components/ui/button"
import { useCharacters } from "@/hooks/use-characters"
import { RECENCY_TEXT } from "@/lib/library-recency"
import { CHARACTERS_SECTION, hasGraph } from "@/lib/library-sections"
import { cn } from "@/lib/utils"
import { AddToCampaignDialog } from "./AddToCampaignDialog"
import { AddToCampaignNotice } from "./AddToCampaignNotice"
import { CollectionPage } from "./CollectionPage"
import { CollectionFilterPill } from "./CollectionFilterPill"
import { CopyWithLinksDialog } from "./CopyWithLinksDialog"
import { LibraryAllView } from "./LibraryAllView"
import { LibraryCharacters } from "./LibraryCharacters"
import { LibrarySearch } from "./LibrarySearch"
import { LibrarySections } from "./LibrarySections"
import { LibraryToolbar } from "./LibraryToolbar"
import { NewMapDialog } from "./NewMapDialog"
import { useLibraryPage } from "./useLibraryPage"
import { useNewCharacter } from "./useNewCharacter"
import { WorldBulkBar } from "./WorldBulkBar"
import { WorldEntryDialogs } from "./WorldEntryDialogs"
import { WorldEntryResults } from "./WorldEntryResults"
import { WorldGridSkeleton } from "./WorldGridSkeleton"

// The library as a page, unlike a campaign's World: one sticky row with the search on the
// left and the filters, views and New for the open section on the right, and
// below it a sticky column of sections (All, Maps, World entries and its kinds) beside the
// entries. Maps are landscape tiles. "All" is the newest of each section.
export function LibraryPage() {
  const page = useLibraryPage()
  const { section, mode, selection, addTo } = page
  const { characters } = useCharacters()
  const newCharacter = useNewCharacter()
  const onCharacters = section.id === CHARACTERS_SECTION.id
  const searching = page.query.trim() !== "" || page.recency !== "any"
  const problem = page.error ?? page.actionError
  const grouped = section.id === "all" && mode === "grid" && !searching

  return (
    <>
      <CollectionPage
        tabs={<LibrarySearch query={page.query} onQuery={page.setQuery} />}
        actions={
          onCharacters ? (
            <Button onClick={newCharacter.open}>
              <Plus className="size-4" />
              New character
            </Button>
          ) : (
            <LibraryToolbar
              recency={page.recency}
              onRecency={page.setRecency}
              mode={mode}
              onMode={page.setMode}
              graph={hasGraph(section)}
              cardSize={page.cardSize}
              onCardSize={page.setCardSize}
              makes={section.makes}
              onNew={page.make}
            />
          )
        }
      >
        <div className="flex flex-1 flex-col gap-4 md:flex-row md:gap-8">
          <aside className="md:sticky md:top-[calc(var(--collection-top)+1.5rem)] md:self-start">
            <LibrarySections
              entries={page.entries}
              active={section.id}
              onChange={page.setSection}
              extra={[{ section: CHARACTERS_SECTION, count: characters?.length ?? null }]}
            />
          </aside>
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            {problem && <FormAlert tone="error">{problem}</FormAlert>}
            {onCharacters ? (
              <LibraryCharacters characters={characters} query={page.query} onNew={newCharacter.open} />
            ) : (
            <LoadingGate
              loading={!page.entries && !page.error}
              className="flex min-h-0 flex-1 flex-col"
              skeleton={<WorldGridSkeleton />}
            >
              {() =>
                page.shown && (
                  <div
                    className={cn(
                      "flex flex-1 flex-col",
                      mode === "graph" &&
                        "h-[calc(100svh-var(--collection-top)-3rem)] min-h-[28rem] overflow-hidden rounded-lg border"
                    )}
                  >
                    {grouped && page.shown.length > 0 ? (
                      <LibraryAllView
                        entries={page.shown}
                        manage={page.manage}
                        selection={selection}
                        size={page.cardSize}
                        onSee={page.setSection}
                      />
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
      </CollectionPage>

      {page.recency !== "any" && (
        <CollectionFilterPill
          text={`Showing entries ${RECENCY_TEXT[page.recency]}`}
          raised={selection.active || addTo.notice !== null}
          onClear={() => page.setRecency("any")}
        />
      )}
      <WorldBulkBar selection={selection} bulk={page.bulk} onAddToCampaign={() => addTo.open(page.bulk.chosen)} />
      {addTo.notice && <AddToCampaignNotice notice={addTo.notice} />}
      <AddToCampaignDialog target={addTo} />
      <CopyWithLinksDialog {...addTo.copyDialog} />
      <NewMapDialog open={page.making} onClose={() => page.setMaking(false)} />
      {newCharacter.dialog}
      <WorldEntryDialogs
        renaming={page.renaming}
        deleting={page.removal.deleting}
        busy={page.removal.busy}
        reload={page.reload}
        onDelete={page.removal.confirm}
        onCloseRename={() => page.setRenaming(null)}
        onCloseDelete={() => page.removal.setDeleting(null)}
      />
    </>
  )
}
