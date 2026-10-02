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
      <div className="flex min-w-0 items-start gap-3">
        <EditableName name={name} onSave={canManage ? onRename : null} />
        <div className="flex shrink-0 items-center gap-3 pt-1.5">
          {canManage && <SaveIndicator state={rest.state.saveState} />}
          <Badge variant="outline">{WORLD_KINDS[kind].label}</Badge>
        </div>
      </div>
      {/* The image is as tall as three fact rows (36px each on mobile, 48px above). */}
      <div className="flex items-start gap-3 sm:gap-4 [--image-size:7rem] sm:[--image-size:9.25rem]">
        <WorldEntryImage kind={kind} canManage={canManage} {...rest} />
        <WorldEntryFacts kind={kind} canManage={canManage} {...rest} />
      </div>
    </div>
  )
}
