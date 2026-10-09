import { Footprints, Shield } from "lucide-react"
import { STAT_BLOCK_FIELD, WORLD_KINDS } from "@/lib/world-kinds"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { isStatBlockEmpty, readStatBlock, toStoredStatBlock } from "@/lib/stat-block"
import type { StatBlock } from "@/lib/stat-block"
import { HealthTile } from "./HealthTile"
import { PrivateToggle } from "./PrivateToggle"
import { StatTile } from "./StatTile"
import type { WorldFieldsState } from "./WorldFields"

type Props = {
  kind: WorldEntryKind
  canManage: boolean
  state: WorldFieldsState
  hidden?: boolean
}

// Empty text stays unset; anything else must be a number.
function toNumber(text: string) {
  const number = Number(text)
  return text.trim() === "" || !Number.isFinite(number) ? undefined : number
}

// Health, defense and speed of the stat block, beside the image. A private
// block shows nothing to players; its actions section says "Undisclosed".
export function StatTiles({ kind, canManage, state, hidden }: Props) {
  const def = WORLD_KINDS[kind].fields.find((field) => field.key === STAT_BLOCK_FIELD)
  const { fields, setValue, setPrivate } = state
  if (!def || !fields) return null

  const stored = fields[def.key]
  const isPrivate = stored?.private ?? def.privateByDefault ?? false
  if (!canManage && (isPrivate || isStatBlockEmpty(stored?.value))) return null

  const block = readStatBlock(stored?.value)
  const save = (change: Partial<StatBlock>) =>
    setValue(def.key, def.type, toStoredStatBlock({ ...block, ...change }))
  const edit = (apply: (text: string) => Partial<StatBlock>) =>
    canManage ? (text: string) => save(apply(text)) : null

  return (
    <div
      className={`bg-card flex flex-col rounded-lg border shadow-xs sm:flex-1 ${hidden ? "border-dashed" : ""}`}
    >
      <div className="flex h-10 items-center justify-between border-b pr-2 pl-4">
        <h3 className="text-muted-foreground text-xs font-medium">Stat block</h3>
        {canManage && (
          <PrivateToggle
            label="Stat block"
            isPrivate={isPrivate}
            onChange={(next) => setPrivate(def.key, def.type, next)}
          />
        )}
      </div>
      <div className="grid flex-1 grid-cols-3 divide-x overflow-hidden rounded-b-lg">
        <HealthTile block={block} onChange={canManage ? save : null} />
        <StatTile
          icon={Shield}
          label="Defense"
          numeric
          value={block.defense?.toString() ?? ""}
          onChange={edit((text) => ({ defense: toNumber(text) }))}
        />
        <StatTile
          icon={Footprints}
          label="Speed"
          value={block.speed ?? ""}
          onChange={edit((text) => ({ speed: text === "" ? undefined : text }))}
        />
      </div>
    </div>
  )
}
