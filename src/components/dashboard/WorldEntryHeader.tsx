import type { WorldEntryKind } from "@/lib/world-kinds"
import { WorldEntryFacts } from "./WorldEntryFacts"
import { StatTiles } from "./StatTiles"
import { WorldEntryImage } from "./WorldEntryImage"
import type { WorldFieldsState } from "./WorldFields"

type Props = {
  entryId: string
  folder: string
  kind: WorldEntryKind
  canManage: boolean
  state: WorldFieldsState
  revealed: boolean
}

// The image and, beside it, the entry's short facts: two cells of the page's grid,
// which sets the image size. The facts card stretches to the image's height.
export function WorldEntryHeader(props: Props) {
  const { kind, canManage, revealed, ...rest } = props

  return (
    <>
      <div className={`relative ${revealed ? "" : "[&_img]:opacity-60 [&_img]:grayscale"}`}>
        <WorldEntryImage kind={kind} canManage={canManage} {...rest} />
      </div>
      <div className="flex min-w-0 flex-col gap-4">
        <WorldEntryFacts kind={kind} canManage={canManage} hidden={!revealed} {...rest} />
        <StatTiles kind={kind} canManage={canManage} hidden={!revealed} {...rest} />
      </div>
    </>
  )
}
