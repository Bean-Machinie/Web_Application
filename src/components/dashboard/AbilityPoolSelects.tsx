import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ABILITIES } from "@/lib/character-templates/srd-5-2-1"
import type { AbilityId } from "@/lib/character-templates/srd-5-2-1"
import type { AbilityFacts } from "./ability-facts"
import type { Scores } from "./ability-scores"
import { AbilityRow } from "./AbilityRow"

type Props = { pool: number[]; base: Scores; facts: AbilityFacts; onBase: (next: Scores) => void }

const CLEAR = "__clear"

// Which number of the pool each ability holds. A number that two abilities share (rolled
// scores can) is handed to the first, then the second.
function holdings(pool: number[], base: Scores) {
  const taken = new Set<number>()
  const held: Partial<Record<AbilityId, number>> = {}
  for (const [id] of ABILITIES) {
    const at = pool.findIndex((score, index) => score === base[id] && !taken.has(index))
    if (at >= 0) {
      taken.add(at)
      held[id] = at
    }
  }
  return { held, taken }
}

// A Select for each ability listing the numbers of the pool, each given to one ability: a
// number another ability holds is not offered, until that one lets go. Used for the Standard
// Array and for rolled scores.
export function AbilityPoolSelects({ pool, base, facts, onBase }: Props) {
  const { held, taken } = holdings(pool, base)

  function give(id: AbilityId, value: string) {
    const next = { ...base }
    if (value === CLEAR) delete next[id]
    else next[id] = pool[Number(value)]
    onBase(next)
  }

  return (
    <div className="grid gap-1">
      {ABILITIES.map(([id, label]) => (
        <AbilityRow key={id} id={id} label={label} facts={facts}>
          <Select value={held[id]?.toString() ?? ""} onValueChange={(value) => give(id, value)}>
            <SelectTrigger size="sm" aria-label={label} className="w-24">
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              {held[id] !== undefined && <SelectItem value={CLEAR}>—</SelectItem>}
              {pool.map((score, index) =>
                taken.has(index) && held[id] !== index ? null : (
                  <SelectItem key={index} value={String(index)}>
                    {score}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </AbilityRow>
      ))}
    </div>
  )
}
