import type { WorldEntryKind } from "@/lib/world-kinds"
import { EditableName } from "./EditableName"
import { EntryMenuButton } from "./EntryMenuButton"
import { EntryStatus } from "./EntryStatus"
import { KindLabel } from "./KindLabel"
import type { WorldFieldsState } from "./WorldFields"

type Props = {
  kind: WorldEntryKind
  name: string
  canManage: boolean
  revealed: boolean
  saveState: WorldFieldsState["saveState"]
  onRename: (name: string) => Promise<void>
  onOpenDetails: () => void
  // Just made: the name opens ready to be typed over.
  fresh: boolean
}

// The name on the left; on the right the status, kind and details button.
export function WorldEntryTitleBar(props: Props) {
  const { kind, name, canManage, revealed, saveState, onRename, onOpenDetails, fresh } = props

  return (
    <div className="flex min-w-0 items-start justify-between gap-3 pb-1">
      <EditableName name={name} onSave={canManage ? onRename : null} autoEdit={fresh} />
      <div className="flex shrink-0 items-center gap-3 pt-1.5">
        <EntryStatus canManage={canManage} revealed={revealed} saveState={saveState} />
        <KindLabel kind={kind} />
        {canManage && <EntryMenuButton onOpen={onOpenDetails} />}
      </div>
    </div>
  )
}
