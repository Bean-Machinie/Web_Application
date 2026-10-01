import { FormAlert } from "@/components/auth/FormAlert"
import { Skeleton } from "@/components/ui/skeleton"
import { useWorldFields } from "@/hooks/use-world-fields"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { FIELD_TYPES } from "./field-types"
import { SaveIndicator } from "./SaveIndicator"
import { WorldFieldRow } from "./WorldFieldRow"

type Props = { entryId: string; kind: WorldEntryKind; canManage: boolean }

// Render with key={entryId}. Players only ever receive the fields they may
// see, so there is nothing to hide here; empty ones are just not shown.
export function WorldFields({ entryId, kind, canManage }: Props) {
  const { fields, error, saveState, setValue, setPrivate } = useWorldFields(entryId)
  const defs = WORLD_KINDS[kind].fields

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
            stored={fields[def.key]}
            manage={
              canManage
                ? {
                    onChange: (value) => setValue(def.key, def.type, value),
                    onPrivate: (isPrivate) => setPrivate(def.key, def.type, isPrivate),
                  }
                : null
            }
          />
        ))}
    </div>
  )
}
