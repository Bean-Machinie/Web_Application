import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useWorldCardSize } from "@/hooks/use-world-card-size"
import { useWorldEntries } from "@/hooks/use-world-entries"
import { NO_FILTER, matchingMonsters } from "@/lib/compendium-monsters"
import type { MonsterFilter } from "@/lib/compendium-monsters"
import { ruleEntry } from "@/lib/rules-terms"
import { srdPath } from "@/lib/srd-paths"
import type { SrdSection } from "@/lib/srd-paths"
import { CardSizeControl } from "./CardSizeControl"
import { CollectionPage } from "./CollectionPage"
import { LibrarySearch } from "./LibrarySearch"
import { LibrarySidebar } from "./LibrarySidebar"
import { MonsterFilters } from "./MonsterFilters"
import { RulesDocument } from "./RulesDocument"
import { SrdCreatureGrid } from "./SrdCreatureGrid"
import { useWorldScope } from "./useWorldScope"

type Props = { section: SrdSection; termId?: string }

// The SRD as a source of the library: the same page and sidebar as Mine, read only. Creatures are
// cards; the rules are the list and term view, in a box where the cards would be.
export function LibrarySrdPage({ section, termId }: Props) {
  const navigate = useNavigate()
  const { entries } = useWorldEntries(useWorldScope())
  const [filter, setFilter] = useState<MonsterFilter>(NO_FILTER)
  const [cardSize, setCardSize] = useWorldCardSize()
  const creatures = section === "creatures"

  return (
    <CollectionPage
      tabs={creatures ? <LibrarySearch query={filter.query} onQuery={(query) => setFilter({ ...filter, query })} placeholder="Search creatures" /> : null}
      actions={
        creatures && (
          <>
            <MonsterFilters filter={filter} onChange={(change) => setFilter({ ...filter, ...change })} />
            <CardSizeControl value={cardSize} onChange={setCardSize} />
          </>
        )
      }
    >
      <div className="flex flex-1 flex-col gap-4 md:flex-row md:gap-8">
        <aside className="md:sticky md:top-[calc(var(--collection-top)+1.5rem)] md:self-start">
          <LibrarySidebar
            entries={entries}
            source="srd"
            active={section}
            onMine={(id) => navigate(id === "all" ? "/app/library" : `/app/library?section=${id}`)}
            onSrd={(id) => navigate(srdPath(id as SrdSection))}
          />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          {creatures ? (
            <SrdCreatureGrid monsters={matchingMonsters(filter)} size={cardSize} />
          ) : (
            <div className="h-[calc(100svh-var(--collection-top)-3rem)] min-h-[28rem] overflow-hidden rounded-lg border">
              <RulesDocument termId={ruleEntry(termId)?.id} onSelect={(id) => navigate(srdPath("rules", id))} />
            </div>
          )}
        </div>
      </div>
    </CollectionPage>
  )
}
