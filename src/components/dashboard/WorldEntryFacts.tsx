import { Lock, LockOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { FieldDef, WorldEntryKind } from "@/lib/world-kinds"
import { FIELD_TYPES } from "./field-types"
import { Undisclosed } from "./Undisclosed"
import type { WorldFieldsState } from "./WorldFields"

type Props = {
  entryId: string
  campaignId: string
  kind: WorldEntryKind
  canManage: boolean
  state: WorldFieldsState
}

function Row({ def, children }: { def: FieldDef; children: React.ReactNode }) {
  return (
    <div className="flex min-h-12 items-center gap-4 px-4 py-2 sm:px-5">
      <dt className="text-muted-foreground w-24 shrink-0 text-sm sm:w-32">{def.label}</dt>
      <dd className="flex min-w-0 flex-1 items-center justify-between gap-2">{children}</dd>
    </div>
  )
}

function PrivateToggle({
  label,
  isPrivate,
  onChange,
}: {
  label: string
  isPrivate: boolean
  onChange: (isPrivate: boolean) => void
}) {
  const Icon = isPrivate ? Lock : LockOpen
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={isPrivate ? "text-foreground" : "text-muted-foreground"}
      aria-pressed={isPrivate}
      aria-label={`${label} is ${isPrivate ? "private" : "visible to players"}`}
      title={isPrivate ? "Private: players see “Undisclosed”" : "Visible to players"}
      onClick={() => onChange(!isPrivate)}
    >
      <Icon />
    </Button>
  )
}

// The short facts of an entry as a property list. A GM edits each value in
// place; a player reads them, private ones as "Undisclosed".
export function WorldEntryFacts({ entryId, campaignId, kind, canManage, state }: Props) {
  const { fields, setValue, saveNow, setPrivate } = state
  const defs = WORLD_KINDS[kind].fields.filter((def) => def.summary)
  if (!fields) return null

  const rows = canManage
    ? defs
    : defs.filter(
        (def) => fields[def.key]?.private || !FIELD_TYPES[def.type].isEmpty(fields[def.key]?.value)
      )
  if (rows.length === 0) return null

  return (
    <dl className="bg-card mb-6 max-w-3xl divide-y rounded-xl border shadow-xs">
      {rows.map((def) => {
        const { Editor, View, saveAtOnce } = FIELD_TYPES[def.type]
        const stored = fields[def.key]
        const isPrivate = stored?.private ?? def.privateByDefault ?? false

        if (!canManage) {
          return (
            <Row key={def.key} def={def}>
              {isPrivate ? <Undisclosed /> : <View value={stored?.value ?? null} options={def.options} />}
            </Row>
          )
        }

        return (
          <Row key={def.key} def={def}>
            <div className="min-w-0 flex-1">
              <Editor
                value={stored?.value ?? null}
                label={def.label}
                placeholder={def.placeholder}
                options={def.options}
                context={{ campaignId, entryId }}
                onChange={(value) =>
                  saveAtOnce ? saveNow(def.key, def.type, value) : setValue(def.key, def.type, value)
                }
              />
            </div>
            {def.canBePrivate && (
              <PrivateToggle
                label={def.label}
                isPrivate={isPrivate}
                onChange={(next) => setPrivate(def.key, def.type, next)}
              />
            )}
          </Row>
        )
      })}
    </dl>
  )
}
