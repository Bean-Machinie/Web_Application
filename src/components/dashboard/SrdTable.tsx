import { useState } from "react"
import { TableBody, TableRow } from "@/components/ui/table"
import type { EntrySelection } from "@/hooks/use-entry-selection"
import { worldHeadClass } from "./members-table-styles"
import { SelectionArea } from "./SelectionArea"
import { SortableHead } from "./SortableHead"
import { SrdTableRow } from "./SrdTableRow"
import type { SrdRow } from "./SrdTableRow"

export type SrdColumn = {
  key: string
  label: string
  // The width, which the Name column does not have: it takes the rest.
  width: string
  // Left out on a narrow screen, where the table keeps to what matters.
  narrowHidden?: boolean
}

const compare = (a: string | number, b: string | number) => (typeof a === "number" && typeof b === "number" ? a - b : String(a).localeCompare(String(b)))

// Null where nothing can be picked, as for rules.
type Props = { columns: SrdColumn[]; rows: SrdRow[]; openId: string | null; selection: EntrySelection | null }

// The list view of the SRD: the World's table, with the columns of what is listed. The header
// stays under the toolbar while the page scrolls.
export function SrdTable({ columns, rows, openId, selection }: Props) {
  const hide = columns.map((column) => (column.narrowHidden ? "max-md:hidden" : ""))
  // A click sorts a column up, then down, then back to the list's own order.
  const [sort, setSort] = useState<{ by: string; dir: "asc" | "desc" } | null>(null)
  const shown = sort ? [...rows].sort((a, b) => compare(a.sort[sort.by], b.sort[sort.by]) * (sort.dir === "asc" ? 1 : -1)) : rows
  const toggle = (by: string) => setSort(sort?.by !== by ? { by, dir: "asc" } : sort.dir === "asc" ? { by, dir: "desc" } : null)
  const head = (key: string, label: string, className = "") => (
    <SortableHead key={key} label={label} direction={sort?.by === key ? sort.dir : null} onSort={() => toggle(key)} base={worldHeadClass} className={className} />
  )

  return (
    <SelectionArea selection={selection}>
      <table data-slot="table" className="bg-card/60 w-full table-fixed caption-bottom text-sm">
        <thead className="bg-background sticky top-(--collection-top) z-20 shadow-[inset_0_-1px_0_var(--border)]">
          <TableRow className="border-b-0 hover:bg-transparent">
            {head("name", "Name")}
            {columns.map((column, index) => head(column.key, column.label, `${column.width} ${hide[index]}`))}
          </TableRow>
        </thead>
        <TableBody>
          {shown.map((row) => (
            <SrdTableRow key={row.id} row={row} selected={openId === row.id} hide={hide} selection={selection} />
          ))}
        </TableBody>
      </table>
    </SelectionArea>
  )
}
