import { ABILITIES, POINT_BUY_BUDGET, POINT_BUY_COSTS, POINT_BUY_MAX, POINT_BUY_MIN } from "./character-templates/srd-5-2-1"
import type { AbilityId } from "./character-templates/srd-5-2-1"
import type { AbilityMethod } from "./character-templates/srd-5-2-1-quick"
import { ROLL, STANDARD_ARRAY } from "./character-templates/srd-5-2-1-scores"
import { suggestedValues } from "./character-rules"
import type { RuleState } from "./character-rules"
import { readStat } from "./character-values"
import type { StoredValue } from "./characters"
import { readRolled } from "./quick-state"

export type Scores = Record<AbilityId, number | null>

export const readScores = (values: Record<string, StoredValue>) =>
  Object.fromEntries(ABILITIES.map(([id]) => [id, readStat(values[id]?.value)])) as Scores

// The numbers a method hands out among the abilities: the Standard Array, or what was rolled.
// Point buy has none; it spends points.
export const poolFor = (method: AbilityMethod, values: Record<string, StoredValue>) =>
  method === "standard" ? STANDARD_ARRAY : method === "own" ? readRolled(values) : []

// What is left of the pool once the abilities have theirs, largest first. The ability `except`
// is not counted as holding its own, so its value is still there for its own list.
export function unassigned(pool: number[], scores: Scores, except?: AbilityId) {
  const left = [...pool]
  for (const [id] of ABILITIES) {
    const at = id === except ? -1 : left.indexOf(scores[id] ?? Number.NaN)
    if (at >= 0) left.splice(at, 1)
  }
  return left.sort((a, b) => b - a)
}

// p. 21 (Point Cost): a base score from 8 to 15, costing from the table, out of 27 points.
export const buyScore = (score: number | null) => Math.min(Math.max(score ?? POINT_BUY_MIN, POINT_BUY_MIN), POINT_BUY_MAX)
export const pointsLeft = (scores: Scores) =>
  POINT_BUY_BUDGET - ABILITIES.reduce((sum, [id]) => sum + POINT_BUY_COSTS[buyScore(scores[id])], 0)
// What one more point of the score costs, or null at the top.
export const raiseCost = (score: number) => (score < POINT_BUY_MAX ? POINT_BUY_COSTS[score + 1] - POINT_BUY_COSTS[score] : null)

// p. 21 (Random Generation): roll four d6 and total the highest three.
export function rollScore(random: () => number = Math.random) {
  const dice = Array.from({ length: ROLL.dice }, () => 1 + Math.floor(random() * ROLL.sides)).sort((a, b) => b - a)
  return dice.slice(0, ROLL.keep).reduce((sum, die) => sum + die, 0)
}
export const rollScores = (random?: () => number) => Array.from({ length: ROLL.scores }, () => rollScore(random)).sort((a, b) => b - a)

// The fields the builder suggests together: the six scores and the background's increase.
export const ABILITY_FIELDS = [...ABILITIES.map(([id]) => id as string), "ability-increase"]

// The scores and the increase as the builder would have them, or null while it has none: until the
// class, species and background are chosen, and for Roll, which hands out no scores.
export function suggestedAbilities(state: RuleState) {
  if (state.rules.method === "own") return null
  const values = suggestedValues(state, ABILITY_FIELDS)
  if (!values) return null
  return {
    scores: Object.fromEntries(ABILITIES.map(([id]) => [id, readStat(values[id])])) as Scores,
    increase: (values["ability-increase"] as string | null) ?? null,
  }
}
