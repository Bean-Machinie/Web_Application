import { TableHead } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { headClass } from "./members-table-styles"
import { SortIcon } from "./SortIcon"

type Props = {
  label: string
  // Null when the list is not sorted by this column.
  direction: "asc" | "desc" | null
  onSort: () => void
}

// A column header you can click to sort by, with the arrow only where it
// says something: always on the sorted column, on hover for the others.
export function SortableHead({ label, direction, onSort }: Props) {
  return (
    <TableHead
      className={headClass}
      aria-sort={direction === "asc" ? "ascending" : direction === "desc" ? "descending" : "none"}
    >
      <button
        type="button"
        onClick={onSort}
        className={cn(
          "group hover:bg-muted hover:text-foreground focus-visible:ring-ring -mx-2 flex cursor-pointer items-center gap-1.5 rounded-sm px-2 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-2",
          direction && "text-foreground"
        )}
      >
        {label}
        <SortIcon
          direction={direction}
          className={cn(
            "size-3.5 transition-opacity",
            !direction && "opacity-0 group-hover:opacity-60 group-focus-visible:opacity-60 [@media(hover:none)]:opacity-40"
          )}
        />
      </button>
    </TableHead>
  )
}
