import { useEffect, useMemo, useRef } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { groupByCategory } from "@/lib/rules-terms"
import type { RuleEntry } from "@/lib/srd-rules-types"

type Props = {
  query: string
  onQuery: (query: string) => void
  entries: RuleEntry[]
  selectedId: string | undefined
  onSelect: (termId: string) => void
}

// The title with what was typed in stronger type.
function Title({ title, query }: { title: string; query: string }) {
  const at = query ? title.toLowerCase().indexOf(query.toLowerCase()) : -1
  if (at < 0) return <>{title}</>
  return (
    <>
      {title.slice(0, at)}
      <mark className="text-foreground bg-transparent font-semibold">{title.slice(at, at + query.length)}</mark>
      {title.slice(at + query.length)}
    </>
  )
}

const ROW =
  "hover:bg-accent hover:text-accent-foreground flex h-8 w-full scroll-mt-9 items-center rounded-md px-2 text-left text-sm data-[active=true]:bg-accent data-[active=true]:text-accent-foreground data-[active=true]:font-medium"

// The search and the entries under their categories, A to Z within each, under small headings
// that stay in view.
export function RulesList({ query, onQuery, entries, selectedId, onSelect }: Props) {
  const selected = useRef<HTMLButtonElement>(null)
  const groups = useMemo(() => groupByCategory(entries), [entries])
  // The selected row is always in view, whether it was clicked or opened from a page; the rows keep a
  // scroll margin so the sticky heading never covers it.
  useEffect(() => {
    selected.current?.scrollIntoView({ block: "nearest" })
  }, [selectedId])

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* The search is its own row: the list scrolls under it, and the headings stay in the
          list's own box, never over the search. */}
      <div className="bg-background relative z-20 shrink-0 border-b p-3">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-5.5 size-4 -translate-y-1/2" />
        <Input aria-label="Search the rules" placeholder="Search rules" value={query} onChange={(event) => onQuery(event.target.value)} className="pl-8" />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pb-3">
        {entries.length === 0 && <p className="text-muted-foreground px-4 py-3 text-sm">Nothing matches “{query}”.</p>}
        {groups.map(({ category, entries: group }) => (
          <section key={category.id} className="mt-4 first:mt-0">
            {/* 28px and a hairline: the rows' scroll margin is this and a little air. */}
            <h2 className="bg-background text-muted-foreground sticky top-0 z-10 mb-1 flex h-7 items-center border-b px-4 text-xs font-semibold">{category.title}</h2>
            <div className="px-2">
              {group.map(({ id, title }) => (
                <button key={id} ref={id === selectedId ? selected : undefined} type="button" data-active={id === selectedId} onClick={() => onSelect(id)} className={ROW}>
                  <span className="truncate">
                    <Title title={title} query={query.trim()} />
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
