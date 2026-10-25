import { useState } from "react"
import { Dices } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ABILITIES, ROLL_DICE } from "@/lib/character-templates/srd-5-2-1"
import { rollScore } from "./ability-scores"
import type { Roll, Scores } from "./ability-scores"
import { AbilityAssign } from "./AbilityAssign"

// Roll four d6 and keep the highest three, six times, with every die shown (the dropped one
// struck out); then give the six totals to the abilities. Rolling again starts over.
export function AbilityRoll({ onApply }: { onApply: (scores: Scores) => void }) {
  const [rolls, setRolls] = useState<{ key: number; results: Roll[] } | null>(null)
  const roll = () => setRolls((old) => ({ key: (old?.key ?? 0) + 1, results: ABILITIES.map(() => rollScore(ROLL_DICE)) }))

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground text-sm">Four d6 each, the lowest die dropped.</span>
        <Button variant={rolls ? "outline" : "default"} onClick={roll}>
          <Dices />
          {rolls ? "Roll again" : "Roll scores"}
        </Button>
      </div>
      {rolls && (
        <>
          <ol className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm tabular-nums">
            {rolls.results.map((result, index) => (
              <li key={index} className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">
                  {result.dice.map((die, at) => (
                    <span key={at} className={at === result.dropped ? "mr-1.5 line-through opacity-50" : "mr-1.5"}>
                      {die}
                    </span>
                  ))}
                </span>
                <span className="font-medium">{result.total}</span>
              </li>
            ))}
          </ol>
          <AbilityAssign key={rolls.key} pool={rolls.results.map((result) => result.total)} onApply={onApply} />
        </>
      )}
    </div>
  )
}
