import { createColumnHelper, rowSortingFeature, tableFeatures } from "@tanstack/react-table"
import type { WorldEntry } from "@/lib/world-entries"
import { formatDate, timeAgo } from "@/lib/time"
import { KindBadge } from "./KindBadge"
import { WorldActionsCell } from "./WorldActionsCell"
import { WorldConnectionsCell } from "./WorldConnectionsCell"
import { WorldNameCell } from "./WorldNameCell"
import { WorldVisibilityCell } from "./WorldVisibilityCell"

// Sorting is done where the entries are ordered (by hand, or by a column), so the
// table only shows it and asks for it.
export const worldTableFeatures = tableFeatures({ rowSortingFeature })

const column = createColumnHelper<typeof worldTableFeatures, WorldEntry>()

// The columns of the list. Visibility is for people who manage the world, the menu
// too; both are in the same place whichever way they are asked for.
export function worldColumns(withVisibility: boolean, withActions: boolean) {
  return column.columns([
    column.accessor("name", {
      id: "name",
      header: "Name",
      sortDescFirst: false,
      cell: ({ row }) => <WorldNameCell entry={row.original} />,
    }),
    column.display({
      id: "kind",
      header: "Kind",
      enableSorting: false,
      cell: ({ row }) => <KindBadge kind={row.original.kind} />,
    }),
    ...(withVisibility
      ? [
          column.display({
            id: "visibility",
            header: "Visibility",
            enableSorting: false,
            cell: ({ row }) => <WorldVisibilityCell entry={row.original} />,
          }),
        ]
      : []),
    column.display({
      id: "connections",
      header: "Connections",
      enableSorting: false,
      cell: ({ row }) => <WorldConnectionsCell entry={row.original} />,
    }),
    column.accessor("updatedAt", {
      id: "updated",
      header: "Last updated",
      sortDescFirst: false,
      cell: ({ row }) => (
        <span className="text-muted-foreground" title={formatDate(row.original.updatedAt)}>
          {timeAgo(row.original.updatedAt)}
        </span>
      ),
    }),
    ...(withActions
      ? [
          column.display({
            id: "actions",
            header: "",
            enableSorting: false,
            cell: ({ row }) => <WorldActionsCell entry={row.original} />,
          }),
        ]
      : []),
  ])
}
