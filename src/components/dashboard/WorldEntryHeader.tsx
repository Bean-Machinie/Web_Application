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
      {/* The facts card stretches to the image's height. On a phone a GM's card
          takes the room its controls need beside a fixed image; for a player the
          card shrinks to its text and the image takes all the rest. */}
      <div
        className={`flex gap-3 sm:items-stretch sm:gap-4 [--image-size:7rem] sm:[--image-size:16rem] lg:[--image-size:20rem] ${
          canManage ? "items-start" : "items-stretch"
        }`}
      >
        <div
          className={
            canManage
              ? ""
              : "max-sm:aspect-square max-sm:min-w-0 max-sm:flex-1 max-sm:self-start max-sm:[--image-size:100%]"
          }
        >
          <WorldEntryImage kind={kind} canManage={canManage} {...rest} />
        </div>
        <WorldEntryFacts kind={kind} canManage={canManage} {...rest} />
      </div>
    </div>
  )
}
