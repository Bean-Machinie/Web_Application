import { FolderPlus, Library } from "lucide-react"
import type { AnimatedIconComponent } from "@/components/AnimatedIcon"
import { EyeIcon } from "@/components/icons/EyeIcon"
import { EyeOffIcon } from "@/components/icons/EyeOffIcon"
import { HoverIcon } from "@/components/icons/HoverIcon"
import { Trash2Icon } from "@/components/icons/Trash2Icon"
import type { LucideIcon } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { EntrySelection } from "@/hooks/use-entry-selection"
import type { useWorldBulk } from "@/hooks/use-world-bulk"
import { plural } from "@/lib/entry-selection"
import { BottomNotice } from "./BottomNotice"
import { ConfirmDialog } from "./ConfirmDialog"
import { CopyWithLinksDialog } from "./CopyWithLinksDialog"
import { SelectionBar } from "./SelectionBar"
import { useWorldScope } from "./useWorldScope"

type Props = {
  selection: EntrySelection
  bulk: ReturnType<typeof useWorldBulk>
  // Only in the library: adds the picked entries to a campaign, through its picker.
  onAddToCampaign?: () => void
}

function Action(props: {
  icon: AnimatedIconComponent | LucideIcon
  label: string
  disabled: boolean
  destructive?: boolean
  // Why the action is not offered, said on hover.
  reason?: string
  onClick: () => void
}) {
  const { icon: Icon, label, disabled, destructive, reason, onClick } = props
  const button = (
    <Button
      variant="ghost"
      size="sm"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={destructive ? "text-destructive hover:text-destructive" : undefined}
    >
      <HoverIcon icon={Icon} size={16} />
      <span className="max-sm:sr-only">{label}</span>
    </Button>
  )
  if (!reason) return button

  // A disabled button gets no pointer events, so the span carries the tooltip.
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0}>{button}</span>
      </TooltipTrigger>
      <TooltipContent>{reason}</TooltipContent>
    </Tooltip>
  )
}

// What can be done to the picked entries: in a campaign's world reveal, hide,
// save to the library and delete; in the library only delete. Once an action
// is done the bar gives way to a short confirmation.
export function WorldBulkBar({ selection, bulk, onAddToCampaign }: Props) {
  const scope = useWorldScope()
  const busy = bulk.progress !== null

  return (
    <>
      {selection.active ? (
        <SelectionBar selection={selection} progress={bulk.progress}>
          {scope.hasVisibility && (
            <>
              <Action icon={EyeIcon} label="Reveal" disabled={busy || !bulk.canReveal} onClick={() => bulk.reveal(true)} />
              <Action icon={EyeOffIcon} label="Hide" disabled={busy || !bulk.canHide} onClick={() => bulk.reveal(false)} />
            </>
          )}
          {onAddToCampaign && (
            <Action icon={FolderPlus} label="Add to campaign…" disabled={busy} onClick={onAddToCampaign} />
          )}
          {scope.canSaveToLibrary && (
            <Action
              icon={Library}
              label="Save to library"
              disabled={busy || !bulk.canSave}
              reason={bulk.saveHint ?? undefined}
              onClick={bulk.saveAll}
            />
          )}
          <Action
            icon={Trash2Icon}
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
      <CopyWithLinksDialog {...bulk.copyDialog} />
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
