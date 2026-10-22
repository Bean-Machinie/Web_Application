import { Fragment } from "react"
import type { PointerEventHandler, ReactNode, Ref } from "react"
import { Search } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { WorldEntry } from "@/lib/world-entries"
import { LibrarySections } from "./LibrarySections"

type Props = {
  entries: WorldEntry[] | null
  // The entries the kind and search leave, or null while loading.
  shown: WorldEntry[] | null
  section: string
  onSection: (section: string) => void
  query: string
  onQuery: (query: string) => void
  loadError?: string | null
  // On a phone: filling a sheet, and with room for fingers.
  compact?: boolean
  autoFocus?: boolean
  // Beside the search, such as a button to make a new entry.
  toolbar?: ReactNode
  // Under the entries, such as the buttons of a picker.
  footer?: ReactNode
  // How one entry looks, and where it stands in the list; the window lays them out.
  // `wide` in the Maps section, whose entries are laid out as landscape tiles.
  renderEntry: (entry: WorldEntry, index: number, wide: boolean) => ReactNode
  // Said when the library has no entries at all.
  emptyText: string
  rootRef?: Ref<HTMLDivElement>
  // Takes the place of the cards, such as the graph.
  graph?: ReactNode
  // For a box dragged across the entries to pick them.
  scroller?: { ref: Ref<HTMLDivElement>; onPointerDown: PointerEventHandler; overlay: ReactNode }
}

const GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
const GRID_WIDE = "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
const GRID_SMALL = "grid grid-cols-3 gap-2"

// Your library as a window: the sections in a column beside it, a search, and the
// entries as cards to scroll through. The height is fixed, so changing kind or
// searching never makes it jump. The Library page and "Add from your library"
// are both this; they differ in what a card does and what sits under it.
export function LibraryWindow(props: Props) {
  const { shown, compact, scroller } = props
  const wide = props.section === "maps"

  return (
    <div
      ref={props.rootRef}
      className={cn(
        "flex min-w-0 flex-col gap-3",
        compact ? "min-h-0 flex-1" : "h-[calc(100svh-11rem)] max-h-[60rem] min-h-80"
      )}
    >
      <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col gap-3", !compact && "sm:flex-row sm:gap-5")}>
        <LibrarySections
          entries={props.entries}
          active={props.section}
          onChange={props.onSection}
          compact={compact}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
          <div className="flex shrink-0 items-center gap-2">
            <InputGroup className="min-w-0 flex-1 pointer-coarse:h-11">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                autoFocus={props.autoFocus ?? !compact}
                autoComplete="off"
                placeholder="Search entries"
                aria-label="Search entries"
                value={props.query}
                onChange={(event) => props.onQuery(event.target.value)}
              />
            </InputGroup>
            {props.toolbar}
          </div>
          {props.loadError && <FormAlert tone="error">{props.loadError}</FormAlert>}
          {props.graph ? (
            <div className="bg-card relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border">
              {props.graph}
            </div>
          ) : (
          // The scrollbar sits in the margin, so the cards line up with the search above.
          <div
            ref={scroller?.ref}
            onPointerDown={scroller?.onPointerDown}
            className={cn(
              "relative min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin]",
              compact ? "py-0.5" : "-mr-3 -ml-2 py-2 pr-3 pl-2"
            )}
          >
            {scroller?.overlay}
            {!shown ? (
              !props.loadError && (
                <div className={compact ? GRID_SMALL : GRID}>
                  {Array.from({ length: 10 }, (_, index) => (
                    <Skeleton key={index} className="aspect-[4/5] w-full" />
                  ))}
                </div>
              )
            ) : shown.length === 0 ? (
              <p className="text-muted-foreground px-2 py-10 text-center text-sm">
                {props.entries?.length === 0
                  ? props.emptyText
                  : "No matches. Try a different name, or another section."}
              </p>
            ) : (
              <div className={cn(compact ? GRID_SMALL : wide ? GRID_WIDE : GRID, "select-none")}>
                {shown.map((entry, index) => (
                  <Fragment key={entry.id}>{props.renderEntry(entry, index, wide)}</Fragment>
                ))}
              </div>
            )}
          </div>
          )}
        </div>
      </div>
      {props.footer}
    </div>
  )
}
