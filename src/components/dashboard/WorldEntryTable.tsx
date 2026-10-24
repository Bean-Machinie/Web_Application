import { HoverIcon } from "@/components/icons/HoverIcon"
import { XIcon } from "@/components/icons/XIcon"
import { useMemo } from "react"
import { useTable } from "@tanstack/react-table"
import type { SortingState, Updater } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table"
import type { EntrySelection } from "@/hooks/use-entry-selection"
import { useRowReorder } from "@/hooks/use-row-reorder"
import type { WorldEntry } from "@/lib/world-entries"
import type { Sort, SortKey } from "@/lib/world-list"
import { worldCellClass, worldHeadClass } from "./members-table-styles"
import { SortableHead } from "./SortableHead"
import { useWorldScope } from "./useWorldScope"
import { WorldEntryRow } from "./WorldEntryRow"
import { WorldTableContext } from "./WorldTableContext"
import { worldColumns, worldTableFeatures } from "./world-columns"
import type { WorldManage } from "./world-manage"

type Props = {
  entries: WorldEntry[]
  // Null for players: no visibility column, no menu.
  manage: WorldManage | null
  // Null where nothing can be picked.
  selection: EntrySelection | null
  // Null while they load.
  connections: ReadonlyMap<string, number> | null
  sort: Sort
  onSort: (sort: Sort) => void
}

// Where each column's width is set; Name takes the rest.
const WIDTH: Record<string, string> = {
  kind: "w-36",
  visibility: "w-40",
  connections: "w-32",
  updated: "w-44",
  actions: "w-16",
}
// On a narrow screen the table keeps to what matters.
const NARROW_HIDDEN = new Set(["kind", "connections", "updated"])

// The list view: a data table, full width, whose header stays under the toolbar while
// the page scrolls. Rows are 56px. Name and Last updated sort; the order the GM
// arranged by hand is the one with no sort, and rows can only be moved then.
export function WorldEntryTable({ entries, manage, selection, connections, sort, onSort }: Props) {
  const { hasVisibility } = useWorldScope()
  const withVisibility = manage !== null && hasVisibility
  const withActions = manage !== null
  const columns = useMemo(() => worldColumns(withVisibility, withActions), [withVisibility, withActions])
  const sorting = useMemo<SortingState>(
    () => (sort ? [{ id: sort.by, desc: sort.dir === "desc" }] : []),
    [sort]
  )
  const { rowProps } = useRowReorder({
    ids: entries.map((entry) => entry.id),
    // A column sort replaces the manual order, so rows cannot be moved then.
    onReorder: sort || selection?.active ? undefined : manage?.onReorder,
  })

  const table = useTable({
    features: worldTableFeatures,
    columns,
    data: entries,
    manualSorting: true,
    state: { sorting },
    onSortingChange: (updater: Updater<SortingState>) => {
      const next = typeof updater === "function" ? updater(sorting) : updater
      onSort(next[0] ? { by: next[0].id as SortKey, dir: next[0].desc ? "desc" : "asc" } : null)
    },
  })
  const hiddenOnNarrow = (id: string) => (NARROW_HIDDEN.has(id) ? "max-md:hidden" : "")

  return (
    <WorldTableContext value={{ manage, selection, connections }}>
      <table data-slot="table" className="w-full table-fixed caption-bottom text-sm">
        <thead className="bg-background sticky top-(--collection-top) z-[5] shadow-[inset_0_-1px_0_var(--border)]">
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id} className="border-b-0 hover:bg-transparent">
              {group.headers.map((header) => {
                const { column } = header
                const width = `${WIDTH[column.id] ?? ""} ${hiddenOnNarrow(column.id)}`
                if (column.getCanSort()) {
                  return (
                    <SortableHead
                      key={header.id}
                      label={String(column.columnDef.header)}
                      direction={column.getIsSorted() || null}
                      onSort={() => column.toggleSorting()}
                      base={worldHeadClass}
                      className={width}
                    />
                  )
                }
                return (
                  <TableHead key={header.id} className={`${worldHeadClass} ${width}`}>
                    {column.id === "actions" && sort ? (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-muted-foreground"
                        aria-label="Clear sort and return to your own order"
                        title="Back to your own order"
                        onClick={() => onSort(null)}
                      >
                        <HoverIcon icon={XIcon} />
                      </Button>
                    ) : (
                      String(column.columnDef.header)
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </thead>
        <TableBody>
          {table.getRowModel().rows.map((row, index) => (
            <WorldEntryRow
              key={row.id}
              entry={row.original}
              selection={selection}
              managed={manage !== null}
              rowProps={rowProps(row.original.id, index)}
            >
              {row.getAllCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={`${worldCellClass} py-2 ${hiddenOnNarrow(cell.column.id)} ${
                    cell.column.id === "actions" ? "text-right" : ""
                  }`}
                >
                  <table.FlexRender cell={cell} />
                </TableCell>
              ))}
            </WorldEntryRow>
          ))}
        </TableBody>
      </table>
    </WorldTableContext>
  )
}
