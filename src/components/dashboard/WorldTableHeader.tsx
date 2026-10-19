import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { nextSort } from "@/lib/world-list"
import type { Sort, SortKey } from "@/lib/world-list"
import { worldHeadClass } from "./members-table-styles"
import { SortableHead } from "./SortableHead"

type Props = {
  // Players get neither of the next two; a library has no visibility.
  withVisibility: boolean
  withActions: boolean
  sort: Sort
  onSort: (sort: Sort) => void
}

export function WorldTableHeader({ withVisibility, withActions, sort, onSort }: Props) {
  const column = (label: string, by: SortKey, className?: string) => (
    <SortableHead
      label={label}
      direction={sort?.by === by ? sort.dir : null}
      onSort={() => onSort(nextSort(sort, by))}
      base={worldHeadClass}
      className={className}
    />
  )

  return (
    // The line lives on the wrapper so it also spans the scroll gutter.
    <TableHeader className="[&_tr]:border-b-0">
      <TableRow className="border-b-0 hover:bg-transparent">
        {column("Name", "name")}
        {column("Type", "type", "hidden md:table-cell")}
        {withVisibility && column("Visibility", "visibility")}
        {withActions && (
          <TableHead className={`${worldHeadClass} text-right`}>
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
