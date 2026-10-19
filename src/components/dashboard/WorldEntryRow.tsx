import { Link, useNavigate } from "react-router-dom"
import { TableCell, TableRow } from "@/components/ui/table"
import type { EntrySelection } from "@/hooks/use-entry-selection"
import type { useRowReorder } from "@/hooks/use-row-reorder"
import type { WorldEntry } from "@/lib/world-entries"
import { WORLD_KINDS } from "@/lib/world-kinds"
import { HiddenBadge } from "./HiddenBadge"
import { KindLabel } from "./KindLabel"
import { MemberMenu } from "./MemberMenu"
import { worldCellClass as cell } from "./members-table-styles"
import { SelectHint } from "./SelectHint"
import { useWorldScope } from "./useWorldScope"
import { VisibilitySwitch } from "./VisibilitySwitch"
import type { WorldManage } from "./world-manage"

type Props = {
  entry: WorldEntry
  manage: WorldManage | null
  selection: EntrySelection | null
  // What useRowReorder gives this row: its place, drag state and handlers.
  rowProps: ReturnType<ReturnType<typeof useRowReorder>["rowProps"]>
}

// One entry of the list view.
export function WorldEntryRow({ entry, manage, selection, rowProps }: Props) {
  const navigate = useNavigate()
  const { basePath, hasVisibility } = useWorldScope()
  const { icon: KindIcon } = WORLD_KINDS[entry.kind]
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
      className={`data-[state=selected]:bg-primary/10! ${hidden ? "bg-muted/50 " : ""}${
        manage
          ? "relative cursor-pointer select-none [-webkit-touch-callout:none] data-lifted:outline data-lifted:-outline-offset-2 data-lifted:outline-ring data-lifted:shadow-[0_24px_28px_rgb(16_24_40/0.18),0_8px_10px_rgb(16_24_40/0.12)]"
          : "relative cursor-pointer"
      }`}
      {...rowProps}
    >
      <TableCell className={cell}>
        <div className="flex items-center gap-3">
          <span
            className={`bg-muted text-muted-foreground flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border ${
              hidden ? "opacity-60 grayscale" : ""
            }`}
          >
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
            <div className="flex max-w-full min-w-0 items-center gap-2">
              <Link
                to={`${basePath}/${entry.id}`}
                onClick={(event) => {
                  if (!selection) return
                  if (selection.active || event.shiftKey || event.ctrlKey || event.metaKey) {
                    event.preventDefault()
                    selection.click(entry.id, event)
                  }
                }}
                className="focus-visible:ring-ring truncate rounded-sm font-medium outline-none focus-visible:ring-2"
              >
                {entry.name}
              </Link>
              {hidden && <HiddenBadge className="shrink-0" />}
            </div>
            {entry.role && (
              <span className="text-muted-foreground max-w-full truncate text-xs">
                {entry.role}
              </span>
            )}
            <KindLabel kind={entry.kind} className="md:hidden" />
          </div>
        </div>
      </TableCell>
      <TableCell className={`${cell} hidden md:table-cell`}>
        <KindLabel kind={entry.kind} />
      </TableCell>
      {manage && hasVisibility && (
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

  return selection ? (
    <SelectHint kind="list" align="start">
      {row}
    </SelectHint>
  ) : (
    row
  )
}
