import { FormAlert } from "@/components/auth/FormAlert"
import { Skeleton } from "@/components/ui/skeleton"
import type { useWorldFields } from "@/hooks/use-world-fields"
import { COVER_FIELD, WORLD_KINDS } from "@/lib/world-kinds"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { FIELD_TYPES } from "./field-types"
import { SaveIndicator } from "./SaveIndicator"
import { WorldFieldRow } from "./WorldFieldRow"

export type WorldFieldsState = ReturnType<typeof useWorldFields>

type Props = {
  entryId: string
  campaignId: string
  kind: WorldEntryKind
  canManage: boolean
  state: WorldFieldsState
}

// Render with key={entryId}. Players only ever receive the fields they may
// see, so there is nothing to hide here; empty ones are just not shown. The
// cover image is shown by the page header, not here.
export function WorldFields({ entryId, campaignId, kind, canManage, state }: Props) {
  const { fields, error, saveState, setValue, saveNow, setPrivate } = state
  const defs = WORLD_KINDS[kind].fields.filter((def) => def.key !== COVER_FIELD)

  if (!fields && !error) return <Skeleton className="my-5 h-44 w-full max-w-3xl" />

  const shown = canManage
    ? defs
    : defs.filter(
        (def) => fields && !FIELD_TYPES[def.type].isEmpty(fields[def.key]?.value)
      )
  if (!canManage && shown.length === 0) return null

  return (
    <div className="max-w-3xl divide-y border-t">
      {canManage && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-muted-foreground text-xs">Changes save automatically.</p>
          <SaveIndicator state={saveState} />
        </div>
      )}
      {error && <FormAlert tone="error">{error}</FormAlert>}
      {fields &&
        shown.map((def) => (
          <WorldFieldRow
            key={def.key}
            def={def}
            context={{ campaignId, entryId }}
            stored={fields[def.key]}
            manage={
              canManage
                ? {
                    onChange: (value) =>
                      FIELD_TYPES[def.type].saveAtOnce
                        ? saveNow(def.key, def.type, value)
                        : setValue(def.key, def.type, value),
                    onPrivate: (isPrivate) => setPrivate(def.key, def.type, isPrivate),
                  }
                : null
            }
          />
        ))}
    </div>
  )
}
