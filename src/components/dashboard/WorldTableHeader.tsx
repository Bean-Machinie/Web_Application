import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import type { EntrySelection } from "@/hooks/use-entry-selection"
import { nextSort } from "@/lib/world-list"
import type { Sort, SortKey } from "@/lib/world-list"
import { headClass } from "./members-table-styles"
import { SortableHead } from "./SortableHead"

type Props = {
  // Players get neither of the next two; a library has no visibility.
  withVisibility: boolean
  withActions: boolean
  // Null where nothing can be picked.
  selection: EntrySelection | null
  sort: Sort
  onSort: (sort: Sort) => void
}

export function WorldTableHeader({ withVisibility, withActions, selection, sort, onSort }: Props) {
  const column = (label: string, by: SortKey, className?: string) => (
    <SortableHead
      label={label}
      direction={sort?.by === by ? sort.dir : null}
      onSort={() => onSort(nextSort(sort, by))}
      className={className}
    />
  )

  return (
    // The line lives on the wrapper so it also spans the scroll gutter.
    <TableHeader className="[&_tr]:border-b-0">
      <TableRow className="border-b-0 hover:bg-transparent">
        {selection && (
          <TableHead className={`${headClass} pr-0 max-md:px-3`}>
            <Checkbox
              checked={
                selection.allVisibleSelected
                  ? true
                  : selection.someVisibleSelected
                    ? "indeterminate"
                    : false
              }
              aria-label="Select all shown entries"
              // Like mail: with anything picked it lets go, otherwise it takes all shown.
              onClick={() => (selection.active ? selection.clear() : selection.selectAllVisible())}
            />
          </TableHead>
        )}
        {column("Name", "name")}
        {column("Type", "type", "hidden md:table-cell")}
        {withVisibility && column("Visibility", "visibility")}
        {withActions && (
          <TableHead className={`${headClass} text-right max-md:px-2`}>
            {sort && (
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-muted-foreground"
                aria-label="Clear sort and return to your own order"
                title="Back to your own order"
                onClick={() => onSort(null)}
              >
                <X />
              </Button>
            )}
          </TableHead>
        )}
      </TableRow>
    </TableHeader>
  )
}
