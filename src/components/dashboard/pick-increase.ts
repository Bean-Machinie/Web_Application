import { parseIncrease, splitIncreaseId, spreadIncreaseId } from "@/lib/character-templates/dnd-5e-2024-tables"
import type { AbilityId, SrdBackground } from "@/lib/character-templates/srd-5-2-1"

export type Level = "0" | "1" | "2"
export type Levels = Partial<Record<AbilityId, Level>>

export const LEVELS = [
  { value: "0" as const, label: "—" },
  { value: "1" as const, label: "+1" },
  { value: "2" as const, label: "+2" },
]

// What is stored, as a level for each of the background’s abilities.
export function levelsFrom(background: SrdBackground, stored: string | null): Levels {
  const parsed = parseIncrease(stored)
  return Object.fromEntries(
    background.abilities.map((id) => [id, parsed?.mode === "spread" ? "1" : parsed?.two === id ? "2" : parsed?.one === id ? "1" : "0"])
  )
}

export const abilitiesAt = (background: SrdBackground, levels: Levels, level: Level) => background.abilities.filter((id) => levels[id] === level)

// The way the levels add up to, or null while they are not one of the two allowed: +2 and
// +1, or +1 to all three.
export function idFor(background: SrdBackground, levels: Levels) {
  const [two, ones] = [abilitiesAt(background, levels, "2"), abilitiesAt(background, levels, "1")]
  if (two.length === 1 && ones.length === 1) return splitIncreaseId(two[0], ones[0])
  return ones.length === 3 ? spreadIncreaseId(background.abilities) : null
}

// The levels after one change: giving +2 to one takes it from another.
export function withLevel(background: SrdBackground, levels: Levels, ability: AbilityId, level: Level): Levels {
  const next = { ...levels, [ability]: level }
  if (level === "2") for (const id of background.abilities) if (id !== ability && next[id] === "2") next[id] = "0"
  return next
}
