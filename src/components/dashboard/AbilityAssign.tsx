import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ABILITIES } from "@/lib/character-templates/srd-5-2-1"
import type { AbilityId } from "@/lib/character-templates/srd-5-2-1"
import type { Scores } from "./ability-scores"

type Props = { pool: number[]; onApply: (scores: Scores) => void }

// Hand out a set of numbers, each to one ability: a row of choices for every ability. Picking
// a number another ability holds moves it. Used for the Standard Array and for rolled scores.
export function AbilityAssign({ pool, onApply }: Props) {
  const [given, setGiven] = useState<Partial<Record<AbilityId, number>>>({})
  const order = pool.map((_, index) => index).sort((a, b) => pool[b] - pool[a])

  function give(ability: AbilityId, index: number | null) {
    setGiven((old) => {
      const next = Object.fromEntries(Object.entries(old).filter(([, other]) => other !== index)) as typeof old
      if (index !== null) next[ability] = index
      else delete next[ability]
      return next
    })
  }

  const count = Object.keys(given).length
  const apply = () => onApply(Object.fromEntries(Object.entries(given).map(([ability, index]) => [ability, pool[index]])))

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        {ABILITIES.map(([id, label]) => (
          <div key={id} className="flex items-center justify-between gap-3">
            <span className="text-sm">{label}</span>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={given[id]?.toString() ?? ""}
              onValueChange={(next) => give(id, next === "" ? null : Number(next))}
              aria-label={label}
            >
              {order.map((index) => (
                <ToggleGroupItem key={index} value={String(index)} className="w-9 tabular-nums">
                  {pool[index]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground text-xs">{count} of {ABILITIES.length} assigned</span>
        <Button onClick={apply} disabled={count === 0}>
          Apply scores
        </Button>
      </div>
    </div>
  )
}
