import { EyeOff, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { EditableName } from "./EditableName"
import { KindLabel } from "./KindLabel"
import { SaveIndicator } from "./SaveIndicator"
import { WorldEntryFacts } from "./WorldEntryFacts"
import { StatTiles } from "./StatTiles"
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
  onOpenDetails: () => void
}

// The name and kind on top, with the visibility pill and the details button
// for a GM; below, the image beside the entry's short facts.
export function WorldEntryHeader(props: Props) {
  const { name, kind, canManage, onRename, revealed, onOpenDetails, ...rest } = props

  return (
    <div className="flex flex-col gap-5 pb-6">
      <div className="flex min-w-0 items-start gap-3">
        <EditableName name={name} onSave={canManage ? onRename : null} />
        <div className="flex shrink-0 items-center gap-3 pt-1.5">
          {canManage && <SaveIndicator state={rest.state.saveState} />}
          {!revealed && (
            <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
              <EyeOff className="size-3.5" />
              Hidden
            </span>
          )}
          <KindLabel kind={kind} />
          {canManage && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Details"
              className="-my-1 -mr-2 size-9 [&_svg]:size-5"
              onClick={onOpenDetails}
            >
              <MoreHorizontal />
            </Button>
          )}
        </div>
      </div>
      {/* On a phone the picture runs the full width with the facts below it. From
          sm up they sit side by side and the card stretches to the image's
          height. The page has 1rem of padding each side. */}
      <div className="flex flex-col gap-4 [--image-size:calc(100vw-2rem)] sm:flex-row sm:items-stretch sm:[--image-size:16rem] lg:[--image-size:20rem]">
        <div className={`relative ${revealed ? "" : "[&_img]:opacity-60 [&_img]:grayscale"}`}>
          <WorldEntryImage kind={kind} canManage={canManage} {...rest} />
        </div>
        <div className="flex min-w-0 flex-col gap-4 sm:flex-1">
          <WorldEntryFacts kind={kind} canManage={canManage} hidden={!revealed} {...rest} />
          <StatTiles kind={kind} canManage={canManage} hidden={!revealed} {...rest} />
        </div>
      </div>
    </div>
  )
}
