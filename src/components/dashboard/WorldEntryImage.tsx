import { Skeleton } from "@/components/ui/skeleton"
import { COVER_FIELD, WORLD_KINDS } from "@/lib/world-kinds"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { FIELD_TYPES } from "./field-types"
import type { WorldFieldsState } from "./WorldFields"

type Props = {
  entryId: string
  campaignId: string
  kind: WorldEntryKind
  canManage: boolean
  state: WorldFieldsState
}

// The entry's picture, top left of its page. A GM can upload, replace or
// remove it; a player sees it read-only.
export function WorldEntryImage({ entryId, campaignId, kind, canManage, state }: Props) {
  const def = WORLD_KINDS[kind].fields.find((field) => field.key === COVER_FIELD)
  if (!def) return null
  if (!state.fields) return <Skeleton className="size-28 rounded-lg" />

  const { Editor, View, saveAtOnce } = FIELD_TYPES[def.type]
  const KindIcon = WORLD_KINDS[kind].icon
  const fallback = <KindIcon className="size-9" />
  const value = state.fields[def.key]?.value ?? null

  return canManage ? (
    <Editor
      value={value}
      label={def.label}
      fallback={fallback}
      context={{ campaignId, entryId }}
      onChange={(next) =>
        saveAtOnce ? state.saveNow(def.key, def.type, next) : state.setValue(def.key, def.type, next)
      }
    />
  ) : (
    <View value={value} fallback={fallback} />
  )
}
