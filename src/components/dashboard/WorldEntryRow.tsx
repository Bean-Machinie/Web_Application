import type { ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { TableRow } from "@/components/ui/table"
import type { EntrySelection } from "@/hooks/use-entry-selection"
import type { useRowReorder } from "@/hooks/use-row-reorder"
import type { WorldEntry } from "@/lib/world-entries"
import { SelectHint } from "./SelectHint"
import { useWorldScope } from "./useWorldScope"

type Props = {
  entry: WorldEntry
  selection: EntrySelection | null
  // Whether the entries can be moved and picked: for a person who manages the world.
  managed: boolean
  // What useRowReorder gives this row: its place, drag state and handlers.
  rowProps: ReturnType<ReturnType<typeof useRowReorder>["rowProps"]>
  // The cells.
  children: ReactNode
}

// One entry of the list view: the row that opens it, picks it, and can be moved.
export function WorldEntryRow({ entry, selection, managed, rowProps, children }: Props) {
  const navigate = useNavigate()
  const { basePath, hasVisibility } = useWorldScope()
  const hidden = hasVisibility && !entry.revealed
  const selected = selection?.isSelected(entry.id) ?? false

  const row = (
    <TableRow
      // The whole row opens the entry. A click handler, not a link
      // stretched over the row: phone browsers do not treat a
      // table row as the box such a link stretches to.
      onClick={(event) => {
        const target = event.target as Element
        if (!event.currentTarget.contains(target)) return
        if (target.closest("a, button, [role=switch]")) return
        // Once anything is picked a click picks; Shift or Ctrl/Cmd picks too.
        if (selection && (selection.active || event.shiftKey || event.ctrlKey || event.metaKey)) {
          selection.click(entry.id, event)
          return
        }
        navigate(`${basePath}/${entry.id}`)
      }}
      data-state={selected ? "selected" : undefined}
      className={`group/row h-14 data-[state=selected]:bg-primary/10! ${hidden ? "bg-muted/50 " : ""}${
        managed
          ? "relative cursor-pointer select-none [-webkit-touch-callout:none] data-lifted:outline data-lifted:-outline-offset-2 data-lifted:outline-ring data-lifted:shadow-[0_24px_28px_rgb(16_24_40/0.18),0_8px_10px_rgb(16_24_40/0.12)]"
          : "relative cursor-pointer"
      }`}
      {...rowProps}
    >
      {children}
    </TableRow>
  )

  return selection ? (
    <SelectHint kind="list" align="start">
      {row}
    </SelectHint>
  ) : (
    row
  )
}
