import { Eye, EyeOff, FolderPlus, Library, Trash2 } from "lucide-react"
import type { ReactNode } from "react"
import type { EntrySelection } from "@/hooks/use-entry-selection"
import type { useWorldBulk } from "@/hooks/use-world-bulk"
import { plural } from "@/lib/entry-selection"
import { BulkMenuContext } from "./BulkMenuContext"
import type { MemberAction } from "./MemberMenu"
import { useWorldScope } from "./useWorldScope"

type Props = {
  selection: EntrySelection
  bulk: ReturnType<typeof useWorldBulk>
  // Only in the library, as in the bar.
  onAddToCampaign?: () => void
  children: ReactNode
}

// Gives the right-click menus of the entries below the actions of the bar, so that on a picked entry
// they act on everything picked. What is offered, and when it is greyed, is the bar's own rule.
export function WorldBulkMenu({ selection, bulk, onAddToCampaign, children }: Props) {
  const scope = useWorldScope()
  const busy = bulk.progress !== null
  const many = plural(bulk.chosen.length)

  const actions: MemberAction[] = [
    ...(scope.hasVisibility
      ? [
          { label: `Reveal ${many}`, icon: Eye, disabled: busy || !bulk.canReveal, onSelect: () => bulk.reveal(true) },
          { label: `Hide ${many}`, icon: EyeOff, disabled: busy || !bulk.canHide, onSelect: () => bulk.reveal(false) },
        ]
      : []),
    ...(onAddToCampaign ? [{ label: "Add to campaign…", icon: FolderPlus, disabled: busy, onSelect: onAddToCampaign }] : []),
    ...(scope.canSaveToLibrary ? [{ label: "Save to library", icon: Library, disabled: busy || !bulk.canSave, onSelect: bulk.saveAll }] : []),
    { label: `Delete ${many}`, icon: Trash2, destructive: true, disabled: busy, onSelect: () => bulk.setConfirmingDelete(true) },
  ]

  return <BulkMenuContext value={{ selection, actions }}>{children}</BulkMenuContext>
}
