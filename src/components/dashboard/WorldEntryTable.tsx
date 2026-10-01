import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useRowReorder } from "@/hooks/use-row-reorder"
import type { WorldEntry } from "@/lib/world-entries"
import { WORLD_KINDS } from "@/lib/world-kinds"
import { MemberMenu } from "./MemberMenu"
import { cellClass, headClass, headRowClass } from "./members-table-styles"
import { VisibilitySwitch } from "./VisibilitySwitch"
import type { WorldManage } from "./world-manage"

type Props = {
  entries: WorldEntry[]
  // Null for players: no visibility column, no menu.
  manage: WorldManage | null
}

export function WorldEntryTable({ entries, manage }: Props) {
  const { rowProps } = useRowReorder({
    ids: entries.map((entry) => entry.id),
    onReorder: manage?.onReorder,
  })

  return (
    <Table>
      <TableHeader>
        <TableRow className={headRowClass}>
          <TableHead className={`${headClass} w-[50%]`}>Name</TableHead>
          <TableHead className={headClass}>Type</TableHead>
          {manage && <TableHead className={headClass}>Visibility</TableHead>}
          {manage && <TableHead className={`${headClass} w-16`} />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry, index) => {
          const { label, icon: KindIcon } = WORLD_KINDS[entry.kind]
          return (
            <TableRow
              key={entry.id}
              className={manage ? "relative select-none [-webkit-touch-callout:none] data-lifted:after:pointer-events-none data-lifted:after:absolute data-lifted:after:inset-0 data-lifted:after:border data-lifted:after:border-ring data-lifted:after:shadow-[0_24px_28px_rgb(16_24_40/0.18),0_8px_10px_rgb(16_24_40/0.12)] data-lifted:after:content-['']" : "relative"}
              {...rowProps(entry.id, index)}
            >
              <TableCell className={cellClass}>
                <div className="flex items-center gap-3">
                  <span className="bg-muted text-muted-foreground flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
                    {entry.imageUrl ? (
                      <img
                        src={entry.imageUrl}
                        alt=""
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    ) : (
                      <KindIcon className="size-5" />
                    )}
                  </span>
                  <Link
                    to={`/app/world/${entry.id}`}
                    // The stretched link makes the whole row clickable; the
                    // controls below sit above it.
                    className="truncate font-medium outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-ring focus-visible:after:ring-2 focus-visible:after:ring-inset"
                  >
                    {entry.name}
                  </Link>
                </div>
              </TableCell>
              <TableCell className={cellClass}>
                <Badge variant="outline">{label}</Badge>
              </TableCell>
              {manage && (
                <TableCell className={cellClass}>
                  <div className="relative z-10 w-fit">
                    <VisibilitySwitch
                      revealed={entry.revealed}
                      name={entry.name}
                      onChange={(revealed) => manage.onReveal(entry, revealed)}
                    />
                  </div>
                </TableCell>
              )}
              {manage && (
                <TableCell className={`${cellClass} text-right`}>
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
  )
}
