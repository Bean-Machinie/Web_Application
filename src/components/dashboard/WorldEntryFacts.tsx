import { WORLD_KINDS } from "@/lib/world-kinds"
import type { FieldDef, WorldEntryKind } from "@/lib/world-kinds"
import { FIELD_TYPES } from "./field-types"
import { PrivateToggle } from "./PrivateToggle"
import { Undisclosed } from "./Undisclosed"
import type { WorldFieldsState } from "./WorldFields"

type Props = {
  entryId: string
  campaignId: string
  kind: WorldEntryKind
  canManage: boolean
  state: WorldFieldsState
  // Hidden from players: drawn with a dashed border like the list cards.
  hidden?: boolean
}

// From this many rows the card fills the height of the image.
const STRETCH_FROM = 4

function Row({ def, children }: { def: FieldDef; children: React.ReactNode }) {
  return (
    <div className="flex min-h-12 flex-1 items-center gap-3 px-4 py-2 sm:gap-4 sm:px-5">
      <dt className="text-muted-foreground w-24 shrink-0 text-sm sm:w-32">{def.label}</dt>
      <dd className="flex min-w-0 flex-1 items-center justify-between gap-2">{children}</dd>
    </div>
  )
}

// The short facts of an entry as a property list. A GM edits each value in
// place; a player reads them, private ones as "Undisclosed".
export function WorldEntryFacts({ entryId, campaignId, kind, canManage, state, hidden }: Props) {
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
    <dl
      className={`bg-card flex min-w-0 flex-col divide-y rounded-lg border shadow-xs ${
        // Few rows would stretch into tall empty bands, so they stay compact.
        rows.length < STRETCH_FROM ? "" : "sm:flex-1"
      } ${hidden ? "border-dashed" : ""}`}
    >
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
                quiet
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
