import { Button } from "@/components/ui/button"
import { STANDARD_ARRAY, STANDARD_ARRAY_BY_CLASS } from "@/lib/character-templates/srd-5-2-1"
import type { AbilityFacts } from "./ability-facts"
import type { Scores } from "./ability-scores"
import { AbilityPoolSelects } from "./AbilityPoolSelects"

type Props = { base: Scores; facts: AbilityFacts; onBase: (next: Scores) => void }

// The Standard Array, one number to each ability, or the SRD's suggestion for the class.
export function AbilityStandardArray({ base, facts, onBase }: Props) {
  const suggestion = facts.cls ? STANDARD_ARRAY_BY_CLASS[facts.cls.id] : null

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground text-xs">Use each of {STANDARD_ARRAY.join(", ")} once.</span>
        {suggestion ? (
          <Button variant="outline" size="sm" onClick={() => onBase(suggestion)}>
            Use {facts.cls!.label} suggestion
          </Button>
        ) : (
          <span className="text-muted-foreground text-xs">Choose a class for a suggestion.</span>
        )}
      </div>
      <AbilityPoolSelects pool={STANDARD_ARRAY} base={base} facts={facts} onBase={onBase} />
    </div>
  )
}
