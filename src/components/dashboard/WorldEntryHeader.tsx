import { Badge } from "@/components/ui/badge"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { EditableName } from "./EditableName"
import { SaveIndicator } from "./SaveIndicator"
import { WorldEntryFacts } from "./WorldEntryFacts"
import { WorldEntryImage } from "./WorldEntryImage"
import type { WorldFieldsState } from "./WorldFields"

type Props = {
  entryId: string
  campaignId: string
  kind: WorldEntryKind
  name: string
  canManage: boolean
  state: WorldFieldsState
  onRename: (name: string) => Promise<void>
}

// The name and kind on top; below, the image beside the entry's short facts.
export function WorldEntryHeader({ name, kind, canManage, onRename, ...rest }: Props) {
  return (
    <div className="flex flex-col gap-5 pb-6">
      <div className="flex min-w-0 items-center gap-2 [&>[role=status]]:ml-auto">
        <EditableName name={name} onSave={canManage ? onRename : null} />
        <Badge variant="outline" className="shrink-0">
          {WORLD_KINDS[kind].label}
        </Badge>
        {canManage && <SaveIndicator state={rest.state.saveState} />}
      </div>
      {/* 9.25rem is the height of three fact rows, so the image matches them. */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start [--image-size:7rem] sm:[--image-size:9.25rem]">
        <WorldEntryImage kind={kind} canManage={canManage} {...rest} />
        <WorldEntryFacts kind={kind} canManage={canManage} {...rest} />
      </div>
    </div>
  )
}
