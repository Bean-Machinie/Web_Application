import { Table, TableBody } from "@/components/ui/table"
import type { EntrySelection } from "@/hooks/use-entry-selection"
import { useRowReorder } from "@/hooks/use-row-reorder"
import type { WorldEntry } from "@/lib/world-entries"
import type { Sort } from "@/lib/world-list"
import { useWorldScope } from "./useWorldScope"
import { scrollClass } from "./WorldEntryGrid"
import { WorldEntryRow } from "./WorldEntryRow"
import { WorldTableHeader } from "./WorldTableHeader"
import type { WorldManage } from "./world-manage"

type Props = {
  entries: WorldEntry[]
  // Null for players: no visibility column, no menu.
  manage: WorldManage | null
  // Null where nothing can be picked: no checkbox column.
  selection: EntrySelection | null
  sort: Sort
  onSort: (sort: Sort) => void
}

export function WorldEntryTable({ entries, manage, selection, sort, onSort }: Props) {
  const { hasVisibility } = useWorldScope()
  const { rowProps } = useRowReorder({
    ids: entries.map((entry) => entry.id),
    // A column sort replaces the manual order, so rows cannot be moved then.
    onReorder: sort || selection?.active ? undefined : manage?.onReorder,
  })

  // The header is its own table above the scrolling body, so the scroll bar
  // starts below it. Both reserve the same gutter and share column widths.
  const columns = (
    <colgroup>
      <col className="md:w-[50%]" />
      <col className="hidden md:table-column" />
      {manage && hasVisibility && <col className="w-16 md:w-auto" />}
      {manage && <col className="w-12 md:w-16" />}
    </colgroup>
  )

  return (
    <>
      <div className={`bg-muted/40 shrink-0 overflow-y-hidden border-b ${manage ? "" : "max-md:hidden"} [scrollbar-gutter:stable] [scrollbar-width:thin]`}>
        <Table className="table-fixed">
          {columns}
          <WorldTableHeader
            withVisibility={manage !== null && hasVisibility}
            withActions={manage !== null}
            sort={sort}
            onSort={onSort}
          />
        </Table>
      </div>
      <div data-world-scroll className={`${scrollClass} [scrollbar-gutter:stable]`}>
        <Table className="table-fixed">
          {columns}
          <TableBody>
            {entries.map((entry, index) => (
              <WorldEntryRow
                key={entry.id}
                entry={entry}
                manage={manage}
                selection={selection}
                rowProps={rowProps(entry.id, index)}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
