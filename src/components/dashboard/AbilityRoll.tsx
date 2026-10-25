import { Dices } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ABILITIES, ROLL_DICE } from "@/lib/character-templates/srd-5-2-1"
import type { AbilityFacts } from "./ability-facts"
import { rollScore } from "./ability-scores"
import type { Roll, Scores } from "./ability-scores"
import { AbilityPoolSelects } from "./AbilityPoolSelects"

type Props = {
  rolls: Roll[] | null
  base: Scores
  facts: AbilityFacts
  onRoll: (rolls: Roll[]) => void
  onBase: (next: Scores) => void
}

// Roll four d6 and keep the highest three, six times, with every die shown (the dropped one
// struck out); then give the six totals to the abilities. Rolling again starts over.
export function AbilityRoll({ rolls, base, facts, onRoll, onBase }: Props) {
  function roll() {
    onRoll(ABILITIES.map(() => rollScore(ROLL_DICE)))
    onBase({})
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground text-xs">Four d6 each, the lowest die dropped.</span>
        <Button variant={rolls ? "outline" : "default"} size="sm" onClick={roll}>
          <Dices />
          {rolls ? "Roll again" : "Roll scores"}
        </Button>
      </div>
      {rolls && (
        <>
          <ol className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm tabular-nums">
            {rolls.map((result, index) => (
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
          <AbilityPoolSelects pool={rolls.map((result) => result.total)} base={base} facts={facts} onBase={onBase} />
        </>
      )}
    </div>
  )
}
