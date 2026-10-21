import { Eye, EyeOff, Library, Trash2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import type { EntrySelection } from "@/hooks/use-entry-selection"
import type { useWorldBulk } from "@/hooks/use-world-bulk"
import { plural } from "@/lib/entry-selection"
import { BottomNotice } from "./BottomNotice"
import { ConfirmDialog } from "./ConfirmDialog"
import { CopyWithPinsDialog } from "./CopyWithPinsDialog"
import { SelectionBar } from "./SelectionBar"
import { useWorldScope } from "./useWorldScope"

type Props = {
  selection: EntrySelection
  bulk: ReturnType<typeof useWorldBulk>
}

function Action(props: {
  icon: LucideIcon
  label: string
  disabled: boolean
  destructive?: boolean
  onClick: () => void
}) {
  const { icon: Icon, label, disabled, destructive, onClick } = props
  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={destructive ? "text-destructive hover:text-destructive" : undefined}
    >
      <Icon className="size-4" />
      <span className="max-sm:sr-only">{label}</span>
    </Button>
  )
}

// What can be done to the picked entries: in a campaign's world reveal, hide,
// save to the library and delete; in the library only delete. Once an action
// is done the bar gives way to a short confirmation.
export function WorldBulkBar({ selection, bulk }: Props) {
  const scope = useWorldScope()
  const busy = bulk.progress !== null

  return (
    <>
      {selection.active ? (
        <SelectionBar selection={selection} progress={bulk.progress}>
          {scope.hasVisibility && (
            <>
              <Action icon={Eye} label="Reveal" disabled={busy || !bulk.canReveal} onClick={() => bulk.reveal(true)} />
              <Action icon={EyeOff} label="Hide" disabled={busy || !bulk.canHide} onClick={() => bulk.reveal(false)} />
            </>
          )}
          {scope.canSaveToLibrary && (
            <Action icon={Library} label="Save to library" disabled={busy || !bulk.canSave} onClick={bulk.saveAll} />
          )}
          <Action
            icon={Trash2}
            label="Delete"
            destructive
            disabled={busy}
            onClick={() => bulk.setConfirmingDelete(true)}
          />
        </SelectionBar>
      ) : (
        bulk.notice && (
          <BottomNotice
            text={bulk.notice.text}
            action={
              bulk.notice.libraryLink && (
                <Button asChild variant="ghost" size="sm" className="shrink-0">
                  <Link to="/app/library">View in library</Link>
                </Button>
              )
            }
          />
        )
      )}
      <CopyWithPinsDialog {...bulk.copyDialog} />
      <ConfirmDialog
        open={bulk.confirmingDelete}
        title={`Delete ${plural(bulk.chosen.length)}?`}
        description="This permanently removes them. It cannot be undone."
        confirmLabel={`Delete ${plural(bulk.chosen.length)}`}
        busy={busy}
        error={null}
        onCancel={() => bulk.setConfirmingDelete(false)}
        onConfirm={bulk.remove}
      />
    </>
  )
}
