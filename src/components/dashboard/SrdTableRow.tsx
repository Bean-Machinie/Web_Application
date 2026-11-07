import type { ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import type { LucideIcon } from "lucide-react"
import { TableCell, TableRow } from "@/components/ui/table"
import type { EntrySelection } from "@/hooks/use-entry-selection"
import { ActionContextMenu } from "./ActionContextMenu"
import type { MemberAction } from "./MemberMenu"
import { worldCellClass } from "./members-table-styles"
import { openInNewTab } from "./openInNewTab"
import { useEntryPanel } from "./useEntryPanel"

export type SrdRow = {
  id: string
  // What the selection calls it, where that is not the id.
  selectId?: string
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

type Props = { row: SrdRow; selected: boolean; hide: string[]; selection: EntrySelection | null }

// One row of the SRD's list, built as an entry's row of the World: 56px, a 40px tile where the
// picture goes, the name with a line under it. A click opens it in the panel; right-click for a tab.
export function SrdTableRow({ row, selected, hide, selection }: Props) {
  const navigate = useNavigate()
  const { openNew } = useEntryPanel()
  const Icon = row.icon
  const pickId = row.selectId ?? row.id
  const picked = selection?.isSelected(pickId) ?? false

  return (
    <ActionContextMenu pickId={pickId} actions={[...openInNewTab(openNew, row.id), ...row.actions]}>
      <TableRow
        data-entry-id={pickId}
        // Shift-click picks a range; it must not also highlight the text between.
        onMouseDown={(event) => event.shiftKey && event.preventDefault()}
        onClick={(event) => {
          if (event.target instanceof Element && event.target.closest("a, button")) return
          // Once anything is picked a click picks; Shift or Ctrl/Cmd picks too.
          if (selection && (selection.active || event.shiftKey || event.ctrlKey || event.metaKey)) {
            selection.click(pickId, event)
            return
          }
          selection?.anchorOn(pickId)
          navigate(row.to)
        }}
        data-state={selected || picked ? "selected" : undefined}
        className="h-14 cursor-pointer select-none data-[state=selected]:bg-primary/10!"
      >
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
