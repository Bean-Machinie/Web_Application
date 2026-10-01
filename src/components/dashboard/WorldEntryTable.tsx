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
        {entries.map((entry) => {
          const { label, icon: KindIcon } = WORLD_KINDS[entry.kind]
          return (
            <TableRow key={entry.id}>
              <TableCell className={cellClass}>
                <div className="flex items-center gap-3">
                  <span className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
                    <KindIcon className="size-5" />
                  </span>
                  <Link
                    to={`/app/world/${entry.id}`}
                    className="truncate font-medium hover:underline"
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
                  <VisibilitySwitch
                    revealed={entry.revealed}
                    name={entry.name}
                    onChange={(revealed) => manage.onReveal(entry, revealed)}
                  />
                </TableCell>
              )}
              {manage && (
                <TableCell className={`${cellClass} text-right`}>
                  <MemberMenu name={entry.name} actions={manage.actionsFor(entry)} />
                </TableCell>
              )}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
