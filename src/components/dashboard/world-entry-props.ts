import type { WorldEntryKind } from "@/lib/world-kinds"
import type { WorldFieldsState } from "./WorldFields"

// What the layouts of an entry page share; WorldEntryView loads it all.
export type EntryProps = {
  entryId: string
  folder: string
  kind: WorldEntryKind
  name: string
  revealed: boolean
  canManage: boolean
  // Just made, and not yet left: the name is ready to be typed over.
  fresh: boolean
  state: WorldFieldsState
  onRename: (name: string) => Promise<void>
  onRevealedChange: (revealed: boolean) => void
  // Asks to delete; WorldEntryView confirms first.
  onDelete: () => void
  // Absent where the entry cannot be saved to the library.
  onSaveToLibrary?: () => void
  detailsOpen: boolean
  onDetailsOpenChange: (open: boolean) => void
}
