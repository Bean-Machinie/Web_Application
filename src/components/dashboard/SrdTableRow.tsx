import type { ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import type { LucideIcon } from "lucide-react"
import { TableCell, TableRow } from "@/components/ui/table"
import { ActionContextMenu } from "./ActionContextMenu"
import type { MemberAction } from "./MemberMenu"
import { worldCellClass } from "./members-table-styles"
import { openInNewTab } from "./openInNewTab"
import { useEntryPanel } from "./useEntryPanel"

export type SrdRow = {
  id: string
  to: string
  title: string
  // Under the name, as a role is under an entry's.
  subtitle?: string
  icon: LucideIcon
  // One per column after the name.
  cells: ReactNode[]
  // What each column sorts by, under its key; the name's is "name".
  sort: Record<string, string | number>
  // The right-click menu after "Open in new tab".
  actions: MemberAction[]
}

type Props = { row: SrdRow; selected: boolean; hide: string[] }

// One row of the SRD's list, built as an entry's row of the World: 56px, a 40px tile where the
// picture goes, the name with a line under it. A click opens it in the panel; right-click for a tab.
export function SrdTableRow({ row, selected, hide }: Props) {
  const navigate = useNavigate()
  const { openNew } = useEntryPanel()
  const Icon = row.icon

  return (
    <ActionContextMenu actions={[...openInNewTab(openNew, row.id), ...row.actions]}>
      <TableRow onClick={() => navigate(row.to)} data-state={selected ? "selected" : undefined} className="h-14 cursor-pointer data-[state=selected]:bg-primary/10!">
        <TableCell className={`${worldCellClass} py-2`}>
          <div className="flex items-center gap-3">
            <span className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-md border">
              <Icon className="size-5" />
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate font-medium">{row.title}</span>
              {row.subtitle && <span className="text-muted-foreground truncate text-xs">{row.subtitle}</span>}
            </div>
          </div>
        </TableCell>
        {row.cells.map((cell, index) => (
          <TableCell key={index} className={`${worldCellClass} py-2 ${hide[index]}`}>
            {cell}
          </TableCell>
        ))}
      </TableRow>
    </ActionContextMenu>
  )
}
