import { useState } from "react"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { parseIncrease, splitIncreaseId, spreadIncreaseId } from "@/lib/character-templates/dnd-5e-2024-tables"
import { ABILITIES, ABILITY_CAP } from "@/lib/character-templates/srd-5-2-1"
import type { AbilityId, SrdBackground } from "@/lib/character-templates/srd-5-2-1"
import type { SheetActions } from "./character-actions"

type Level = "0" | "1" | "2"
type Levels = Record<AbilityId, Level>

const LEVELS = [
  { value: "0" as const, label: "—" },
  { value: "1" as const, label: "+1" },
  { value: "2" as const, label: "+2" },
]
const nameOf = (id: AbilityId) => ABILITIES.find(([other]) => other === id)![1]

// What is stored, as a level for each of the background’s abilities.
function levelsFrom(background: SrdBackground, stored: string | null): Levels {
  const parsed = parseIncrease(stored)
  return Object.fromEntries(
    background.abilities.map((id) => [id, parsed?.mode === "spread" ? "1" : parsed?.two === id ? "2" : parsed?.one === id ? "1" : "0"])
  ) as Levels
}

// The way the levels add up to, or null while they are not one of the two allowed: +2 and
// +1, or +1 to all three.
function idFor(background: SrdBackground, levels: Levels) {
  const of = (level: Level) => background.abilities.filter((id) => levels[id] === level)
  const [two, ones] = [of("2"), of("1")]
  if (two.length === 1 && ones.length === 1) return splitIncreaseId(two[0], ones[0])
  return ones.length === 3 ? spreadIncreaseId(background.abilities) : null
}

type Props = { background: SrdBackground; stored: string | null; actions: SheetActions }

// The background’s increase as a row for each ability it lists: —, +1 or +2. Only the two
// allowed ways are kept: giving +2 to one takes it from another, and the choice is stored
// once the levels make +2 and +1, or +1 for all three. Use with key={background.id}.
export function BuilderIncreaseRows({ background, stored, actions }: Props) {
  const [levels, setLevels] = useState(() => levelsFrom(background, stored))
  const valid = idFor(background, levels) !== null

  function change(ability: AbilityId, level: Level) {
    const next = { ...levels, [ability]: level }
    if (level === "2") for (const id of background.abilities) if (id !== ability && next[id] === "2") next[id] = "0"
    setLevels(next)
    actions.onValue("ability-increase", idFor(background, next))
  }

  return (
    <div className="grid gap-2">
      <p className="text-muted-foreground text-xs">
        Raise one ability by 2 and another by 1, or all three by 1. No score goes above {ABILITY_CAP}.
      </p>
      <div className="grid gap-1">
        {background.abilities.map((id) => (
          <div key={id} className="flex h-9 items-center justify-between gap-3">
            <span className="text-sm">{nameOf(id)}</span>
            <SegmentedControl value={levels[id]} onValueChange={(level) => change(id, level)} options={LEVELS} aria-label={`${nameOf(id)} increase`} className="w-36" />
          </div>
        ))}
      </div>
      {!valid && <p className="text-muted-foreground text-xs">Not complete yet: choose +2 and +1, or +1 for all three.</p>}
    </div>
  )
}
