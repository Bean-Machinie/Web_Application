import { Link, useNavigate } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"
import { useRowReorder } from "@/hooks/use-row-reorder"
import type { WorldEntry } from "@/lib/world-entries"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { Sort } from "@/lib/world-list"
import { MemberMenu } from "./MemberMenu"
import { cellClass } from "./members-table-styles"
import { scrollClass } from "./WorldEntryGrid"
import { VisibilitySwitch } from "./VisibilitySwitch"
import { WorldTableHeader } from "./WorldTableHeader"
import type { WorldManage } from "./world-manage"

type Props = {
  entries: WorldEntry[]
  // Null for players: no visibility column, no menu.
  manage: WorldManage | null
  sort: Sort
  onSort: (sort: Sort) => void
}

// Tighter on phones, where the type moves under the name.
const cell = `${cellClass} max-md:px-3 max-md:py-2`

export function WorldEntryTable({ entries, manage, sort, onSort }: Props) {
  const navigate = useNavigate()
  const { rowProps } = useRowReorder({
    ids: entries.map((entry) => entry.id),
    // A column sort replaces the manual order, so rows cannot be moved then.
    onReorder: sort ? undefined : manage?.onReorder,
  })

  // The header is its own table above the scrolling body, so the scroll bar
  // starts below it. Both reserve the same gutter and share column widths.
  const columns = (
    <colgroup>
      <col className="md:w-[50%]" />
      <col className="hidden md:table-column" />
      {manage && <col className="w-16 md:w-auto" />}
      {manage && <col className="w-12 md:w-16" />}
    </colgroup>
  )

  return (
    <>
      <div className={`bg-muted/40 shrink-0 overflow-y-hidden border-b ${manage ? "" : "max-md:hidden"} [scrollbar-gutter:stable] [scrollbar-width:thin]`}>
        <Table className="table-fixed">
          {columns}
          <WorldTableHeader withVisibility={manage !== null} sort={sort} onSort={onSort} />
        </Table>
      </div>
      <div className={`${scrollClass} [scrollbar-gutter:stable]`}>
        <Table className="table-fixed">
          {columns}
          <TableBody>
            {entries.map((entry, index) => {
              const { label, icon: KindIcon } = WORLD_KINDS[entry.kind]
              return (
                <TableRow
                  key={entry.id}
                  // The whole row opens the entry. A click handler, not a link
                  // stretched over the row: phone browsers do not treat a
                  // table row as the box such a link stretches to.
                  onClick={(event) => {
                    const target = event.target as Element
                    if (!event.currentTarget.contains(target)) return
                    if (target.closest("a, button, [role=switch]")) return
                    navigate(`/app/world/${entry.id}`)
                  }}
                  className={
                    manage
                      ? "relative cursor-pointer select-none [-webkit-touch-callout:none] data-lifted:outline data-lifted:-outline-offset-2 data-lifted:outline-ring data-lifted:shadow-[0_24px_28px_rgb(16_24_40/0.18),0_8px_10px_rgb(16_24_40/0.12)]"
                      : "relative cursor-pointer"
                  }
                  {...rowProps(entry.id, index)}
                >
                  <TableCell className={cell}>
                    <div className="flex items-center gap-3">
                      <span className="bg-muted text-muted-foreground flex size-16 shrink-0 items-center justify-center md:size-20 overflow-hidden rounded-lg border">
                        {entry.imageUrl ? (
                          <img
                            src={entry.imageUrl}
                            alt=""
                            loading="lazy"
                            className="size-full object-cover"
                          />
                        ) : (
                          <KindIcon className="size-6" />
                        )}
                      </span>
                      <div className="flex min-w-0 flex-col items-start gap-1">
                        <Link
                          to={`/app/world/${entry.id}`}
                          className="focus-visible:ring-ring max-w-full truncate rounded-sm font-medium outline-none focus-visible:ring-2"
                        >
                          {entry.name}
                        </Link>
                        <Badge variant="outline" className="md:hidden">
                          {label}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className={`${cell} hidden md:table-cell`}>
                    <Badge variant="outline">{label}</Badge>
                  </TableCell>
                  {manage && (
                    <TableCell className={cell}>
                      <div className="relative z-10 w-fit">
                        <VisibilitySwitch
                          compact
                          revealed={entry.revealed}
                          name={entry.name}
                          onChange={(revealed) => manage.onReveal(entry, revealed)}
                        />
                      </div>
                    </TableCell>
                  )}
                  {manage && (
                    <TableCell className={`${cell} text-right`}>
                      <div className="relative z-10 inline-block">
                        <MemberMenu name={entry.name} actions={manage.actionsFor(entry)} />
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
