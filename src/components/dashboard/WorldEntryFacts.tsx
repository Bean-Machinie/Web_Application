import { Lock, LockOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { FieldDef, WorldEntryKind } from "@/lib/world-kinds"
import type { StoredField } from "@/lib/world-fields"
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

function Fact({ def, children }: { def: FieldDef; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <dt className="text-muted-foreground text-xs font-medium">{def.label}</dt>
      <dd className="flex min-h-8 items-center gap-1">{children}</dd>
    </div>
  )
}

function PrivateToggle({
  def,
  isPrivate,
  onChange,
}: {
  def: FieldDef
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
      aria-label={`${def.label} is ${isPrivate ? "private" : "visible to players"}`}
      title={isPrivate ? "Private: players see “Undisclosed”" : "Visible to players"}
      onClick={() => onChange(!isPrivate)}
    >
      <Icon />
    </Button>
  )
}

// The short facts beside the name, as a property list. A GM edits them in
// place; a player reads them, with private ones shown as "Undisclosed".
export function WorldEntryFacts({ entryId, campaignId, kind, canManage, state }: Props) {
  const { fields, setValue, saveNow, setPrivate } = state
  const defs = WORLD_KINDS[kind].fields.filter((def) => def.summary)
  if (!fields || defs.length === 0) return null

  const visible = canManage
    ? defs
    : defs.filter((def) => {
        const stored: StoredField | undefined = fields[def.key]
        return stored?.private || !FIELD_TYPES[def.type].isEmpty(stored?.value)
      })
  if (visible.length === 0) return null

  return (
    <dl className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-x-5 gap-y-3">
      {visible.map((def) => {
        const { Editor, View, saveAtOnce } = FIELD_TYPES[def.type]
        const stored = fields[def.key]
        const isPrivate = stored?.private ?? def.privateByDefault ?? false

        if (!canManage) {
          return (
            <Fact key={def.key} def={def}>
              {isPrivate ? <Undisclosed /> : <View value={stored?.value ?? null} options={def.options} />}
            </Fact>
          )
        }

        return (
          <Fact key={def.key} def={def}>
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
                def={def}
                isPrivate={isPrivate}
                onChange={(next) => setPrivate(def.key, def.type, next)}
              />
            )}
          </Fact>
        )
      })}
    </dl>
  )
}
