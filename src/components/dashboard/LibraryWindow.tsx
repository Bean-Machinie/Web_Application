import { Fragment } from "react"
import type { PointerEventHandler, ReactNode, Ref } from "react"
import { Search } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { WorldEntry } from "@/lib/world-entries"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { worldKinds } from "@/lib/world-kinds"
import { MarkerKindTabs } from "./MarkerKindTabs"

type Props = {
  entries: WorldEntry[] | null
  // The entries the kind and search leave, or null while loading.
  shown: WorldEntry[] | null
  kind: WorldEntryKind | null
  onKind: (kind: WorldEntryKind | null) => void
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
  // How one entry looks; the window lays them out.
  renderEntry: (entry: WorldEntry) => ReactNode
  // Said when the library has no entries at all.
  emptyText: string
  rootRef?: Ref<HTMLDivElement>
  // For a box dragged across the entries to pick them.
  scroller?: { ref: Ref<HTMLDivElement>; onPointerDown: PointerEventHandler; overlay: ReactNode }
}

const GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
const GRID_SMALL = "grid grid-cols-3 gap-2"

// Your library as a window: the kinds in a column beside it, a search, and the
// entries as cards to scroll through. The height is fixed, so changing kind or
// searching never makes it jump. The Library page and "Add from your library"
// are both this; they differ in what a card does and what sits under it.
export function LibraryWindow(props: Props) {
  const { shown, compact, scroller } = props

  return (
    <div
      ref={props.rootRef}
      className={cn(
        "flex min-w-0 flex-col gap-3",
        compact ? "min-h-0 flex-1" : "h-[calc(100svh-11rem)] max-h-[60rem] min-h-80"
      )}
    >
      <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col gap-3", !compact && "sm:flex-row sm:gap-5")}>
        <MarkerKindTabs
          entries={props.entries}
          active={props.kind}
          onChange={props.onKind}
          compact={compact}
          kinds={worldKinds}
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
          {/* The scrollbar sits in the margin, so the cards line up with the search above. */}
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
                  : "No matches. Try a different name, or another kind."}
              </p>
            ) : (
              <div className={cn(compact ? GRID_SMALL : GRID, "select-none")}>
                {shown.map((entry) => (
                  <Fragment key={entry.id}>{props.renderEntry(entry)}</Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {props.footer}
    </div>
  )
}
