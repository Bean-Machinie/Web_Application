import { Badge } from "@/components/ui/badge"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { EditableName } from "./EditableName"
import { HiddenBadge } from "./HiddenBadge"
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
  revealed: boolean
}

// The name and kind on top; below, the image beside the entry's short facts.
export function WorldEntryHeader({ name, kind, canManage, onRename, revealed, ...rest }: Props) {
  return (
    <div className="flex flex-col gap-5 pb-6">
      <div className="flex min-w-0 items-start gap-3">
        <EditableName name={name} onSave={canManage ? onRename : null} />
        <div className="flex shrink-0 items-center gap-3 pt-1.5">
          {canManage && <SaveIndicator state={rest.state.saveState} />}
          <Badge variant="outline">{WORLD_KINDS[kind].label}</Badge>
        </div>
      </div>
      {/* On a phone the picture runs the full width with the facts below it. From
          sm up they sit side by side and the card stretches to the image's
          height. The page has 1rem of padding each side. */}
      <div className="flex flex-col gap-4 [--image-size:calc(100vw-2rem)] sm:flex-row sm:items-stretch sm:[--image-size:16rem] lg:[--image-size:20rem]">
        <div className={`relative ${revealed ? "" : "[&_img]:opacity-60 [&_img]:grayscale"}`}>
          <WorldEntryImage kind={kind} canManage={canManage} {...rest} />
          {!revealed && <HiddenBadge className="pointer-events-none absolute top-2 left-2" />}
        </div>
        <WorldEntryFacts kind={kind} canManage={canManage} hidden={!revealed} {...rest} />
      </div>
    </div>
  )
}
