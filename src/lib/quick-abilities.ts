import { ABILITIES, POINT_BUY_BUDGET, POINT_BUY_COSTS, POINT_BUY_MAX, POINT_BUY_MIN } from "./character-templates/srd-5-2-1"
import type { AbilityId } from "./character-templates/srd-5-2-1"
import { STANDARD_ARRAY } from "./character-templates/srd-5-2-1-scores"
import { suggestedValues } from "./character-rules"
import type { RuleState } from "./character-rules"
import { readStat } from "./character-values"
import type { StoredValue } from "./characters"

export type Scores = Record<AbilityId, number | null>

export const readScores = (values: Record<string, StoredValue>) =>
  Object.fromEntries(ABILITIES.map(([id]) => [id, readStat(values[id]?.value)])) as Scores

// Giving an ability a number of the Standard Array: the ability that held it takes this one's old
// number in turn. Null when the number is not in the array. The scores that change, for setScores.
export function assign(scores: Scores, id: AbilityId, value: number): Partial<Scores> | null {
  if (!STANDARD_ARRAY.includes(value)) return null
  const holder = ABILITIES.find(([other]) => other !== id && scores[other] === value)?.[0]
  return holder ? { [id]: value, [holder]: scores[id] } : { [id]: value }
}

// p. 21 (Point Cost): a base score from 8 to 15, costing from the table, out of 27 points.
export const buyScore = (score: number | null) => Math.min(Math.max(score ?? POINT_BUY_MIN, POINT_BUY_MIN), POINT_BUY_MAX)
export const pointsLeft = (scores: Scores) =>
  POINT_BUY_BUDGET - ABILITIES.reduce((sum, [id]) => sum + POINT_BUY_COSTS[buyScore(scores[id])], 0)
// What one more point of the score costs, or null at the top.
export const raiseCost = (score: number) => (score < POINT_BUY_MAX ? POINT_BUY_COSTS[score + 1] - POINT_BUY_COSTS[score] : null)

// The fields the builder suggests together: the six scores and the background's increase.
export const ABILITY_FIELDS = [...ABILITIES.map(([id]) => id as string), "ability-increase"]

// The scores and the increase as the builder would have them, or null while it has none: until the
// class, species and background are chosen.
export function suggestedAbilities(state: RuleState) {
  const values = suggestedValues(state, ABILITY_FIELDS)
  if (!values) return null
  return {
    scores: Object.fromEntries(ABILITIES.map(([id]) => [id, readStat(values[id])])) as Scores,
    increase: (values["ability-increase"] as string | null) ?? null,
  }
}
