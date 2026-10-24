import { FolderPlus, Library, Pencil } from "lucide-react"
import { HammerIcon } from "@/components/icons/HammerIcon"
import { Trash2Icon } from "@/components/icons/Trash2Icon"
import { errorMessage } from "@/lib/campaigns"
import type { WorldEntry } from "@/lib/world-entries"
import type { MemberAction } from "./MemberMenu"

// What a person with manage_world can do to entries; null for players. The
// table uses actionsFor; the grid builds its own menu from the individual
// actions.
export type WorldManage = {
  onReveal: (entry: WorldEntry, revealed: boolean) => void
  onRename: (entry: WorldEntry) => void
  onDelete: (entry: WorldEntry) => void
  // Absent where entries cannot be saved to the library.
  onSaveToLibrary?: (entry: WorldEntry) => void
  // Only in the library: opens the picker of campaigns to add the entry to.
  onAddToCampaign?: (entry: WorldEntry) => void
  // Only in the library: for a map made in the builder, the way back into it.
  onOpenBuilder?: (entry: WorldEntry) => void
  isBuilt?: (entry: WorldEntry) => boolean
  // The shown entries' ids in their new order.
  onReorder: (ids: string[]) => void
  actionsFor: (entry: WorldEntry) => MemberAction[]
}

type Handlers = {
  setRevealed: (id: string, revealed: boolean) => Promise<void>
  reorder: (ids: string[]) => Promise<void>
  onRename: (entry: WorldEntry) => void
  onDelete: (entry: WorldEntry) => void
  onSaveToLibrary?: (entry: WorldEntry) => void
  onAddToCampaign?: (entry: WorldEntry) => void
  onOpenBuilder?: (entry: WorldEntry) => void
  isBuilt?: (entry: WorldEntry) => boolean
  // Null clears the message before an action starts.
  setError: (message: string | null) => void
}

export function createWorldManage(handlers: Handlers): WorldManage {
  const { setRevealed, reorder, onRename, onDelete, onSaveToLibrary, onAddToCampaign, onOpenBuilder, isBuilt, setError } = handlers
  const report = (failure: unknown) => setError(errorMessage(failure))
  const save = onSaveToLibrary && ((entry: WorldEntry) => {
    setError(null)
    onSaveToLibrary(entry)
  })

  return {
    onReveal: (entry, revealed) => {
      setError(null)
      setRevealed(entry.id, revealed).catch(report)
    },
    onReorder: (ids) => {
      setError(null)
      reorder(ids).catch(report)
    },
    onRename,
    onDelete,
    onSaveToLibrary: save,
    onAddToCampaign,
    onOpenBuilder,
    isBuilt,
    actionsFor: (entry) => [
      ...(onOpenBuilder && isBuilt?.(entry)
        ? [{ label: "Open in builder", icon: HammerIcon, onSelect: () => onOpenBuilder(entry) }]
        : []),
      { label: "Rename", icon: Pencil, onSelect: () => onRename(entry) },
      ...(onAddToCampaign
        ? [{ label: "Add to campaign…", icon: FolderPlus, onSelect: () => onAddToCampaign(entry) }]
        : []),
      ...(save
        ? [{ label: "Save to library", icon: Library, onSelect: () => save(entry) }]
        : []),
      {
        label: "Delete",
        icon: Trash2Icon,
        destructive: true,
        onSelect: () => onDelete(entry),
      },
    ],
  }
}
