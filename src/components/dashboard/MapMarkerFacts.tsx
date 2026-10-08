import { Lock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { firstLine } from "@/lib/rich-text-line"
import type { StoredField } from "@/lib/world-fields"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { FieldDef, WorldEntryKind } from "@/lib/world-kinds"
import { FIELD_TYPES } from "./field-types"
import { Undisclosed } from "./Undisclosed"

type Props = {
  kind: WorldEntryKind
  // Null while loading.
  fields: Record<string, StoredField> | null
  canManage: boolean
}

// A GM sees every value, with a lock on the private ones. A player sees the
// same as on the entry's page: private fields with something in them show as
// "Undisclosed", and empty ones are left out.
function Value({ def, stored, canManage }: { def: FieldDef; stored: StoredField; canManage: boolean }) {
  if (stored.private && !canManage) return <Undisclosed />
  const { View } = FIELD_TYPES[def.type]
  return (
    <>
      <View value={stored.value} options={def.options} />
      {stored.private && <Lock className="text-muted-foreground size-3 shrink-0" />}
    </>
  )
}

// The key facts of a kind and the first line of its description, for a
// marker's preview.
export function MapMarkerFacts({ kind, fields, canManage }: Props) {
  const registry = WORLD_KINDS[kind]
  const description = registry.fields.find((def) => def.key === "description")
  if (registry.previewFacts.length === 0 && !description) return null

  if (!fields) {
    return (
      <div className="flex flex-col gap-2 border-t pt-2.5">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3.5 w-full" />
      </div>
    )
  }

  const facts = registry.previewFacts
    .map((key) => ({ def: registry.fields.find((field) => field.key === key), stored: fields[key] }))
    .filter(
      (fact): fact is { def: FieldDef; stored: StoredField } =>
        !!fact.def &&
        !!fact.stored &&
        ((fact.stored.private && !canManage) ||
          !FIELD_TYPES[fact.def.type].isEmpty(fact.stored.value))
    )

  const stored = fields.description
  const line = stored ? firstLine(stored.value) : ""
  // The server only sends a private row to a player when it holds something.
  const undisclosed = !!stored?.private && !canManage
  const showDescription = undisclosed || line !== ""

  if (facts.length === 0 && !showDescription) return null

  return (
    <div className="flex flex-col gap-2 border-t pt-2.5">
      {facts.length > 0 && (
        <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1.5 text-xs">
          {facts.map(({ def, stored: fact }) => (
            <div key={def.key} className="col-span-2 grid grid-cols-subgrid items-center">
              <dt className="text-muted-foreground">{def.label}</dt>
              <dd className="flex min-w-0 items-center gap-1.5">
                <Value def={def} stored={fact} canManage={canManage} />
              </dd>
            </div>
          ))}
        </dl>
      )}
      {showDescription &&
        (undisclosed ? (
          <Undisclosed />
        ) : (
          <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">{line}</p>
        ))}
    </div>
  )
}
