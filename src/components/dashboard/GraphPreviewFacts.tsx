import { Skeleton } from "@/components/ui/skeleton"
import { allText } from "@/lib/rich-text-line"
import type { StoredField } from "@/lib/world-fields"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { FieldDef, WorldEntryKind } from "@/lib/world-kinds"
import { FIELD_TYPES } from "./field-types"
import { Value } from "./MapMarkerFacts"
import { Undisclosed } from "./Undisclosed"

type Props = {
  kind: WorldEntryKind
  // Null while loading.
  fields: Record<string, StoredField> | null
  canManage: boolean
}

// Two rows of facts and three lines of description. Each takes its space whether or
// not there is anything to show in it, and so does the skeleton, so the card is the
// same size for every entry and does not change when the fields arrive.
const ROWS = 2

function Row({ children }: { children?: React.ReactNode }) {
  return <div className="grid h-5 grid-cols-[5.5rem_1fr] items-center gap-x-3 overflow-hidden text-xs">{children}</div>
}

export function GraphPreviewFacts({ kind, fields, canManage }: Props) {
  const registry = WORLD_KINDS[kind]

  if (!fields) {
    return (
      <div className="grid gap-2 border-t pt-2.5">
        <div className="grid gap-1.5">
          {Array.from({ length: ROWS }, (_, row) => (
            <Row key={row}>
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-3 w-24" />
            </Row>
          ))}
        </div>
        <div className="grid h-[3.7rem] content-start gap-1.5">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    )
  }

  const facts = Array.from({ length: ROWS }, (_, index) => {
    const def = registry.fields.find((field) => field.key === registry.previewFacts[index])
    const stored = def && fields[def.key]
    const shown = def && stored && ((stored.private && !canManage) || !FIELD_TYPES[def.type].isEmpty(stored.value))
    return shown ? { def: def as FieldDef, stored } : null
  })

  const description = fields.description
  const text = description ? allText(description.value) : ""
  // The server only sends a private row to a player when it holds something.
  const undisclosed = !!description?.private && !canManage

  return (
    <div className="grid gap-2 border-t pt-2.5">
      <dl className="grid gap-1.5">
        {facts.map((fact, index) => (
          <Row key={index}>
            {fact && (
              <>
                <dt className="text-muted-foreground truncate">{fact.def.label}</dt>
                <dd className="flex min-w-0 items-center gap-1.5">
                  <Value def={fact.def} stored={fact.stored} canManage={canManage} />
                </dd>
              </>
            )}
          </Row>
        ))}
      </dl>
      <div className="h-[3.7rem] overflow-hidden">
        {undisclosed ? (
          <Undisclosed />
        ) : (
          <p className="text-muted-foreground line-clamp-3 text-xs leading-relaxed">{text}</p>
        )}
      </div>
    </div>
  )
}
