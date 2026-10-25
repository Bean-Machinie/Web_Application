import { Input } from "@/components/ui/input"
import { ABILITIES } from "@/lib/character-templates/srd-5-2-1"
import { toWhole } from "@/lib/character-values"
import type { AbilityFacts } from "./ability-facts"
import type { Scores } from "./ability-scores"
import { AbilityRow } from "./AbilityRow"

type Props = { base: Scores; facts: AbilityFacts; onBase: (next: Scores) => void }

// Type each score, for rolls made elsewhere or scores from a book.
export function AbilityManual({ base, facts, onBase }: Props) {
  function type(id: string, text: string) {
    const next = { ...base }
    const score = toWhole(text)
    if (score === null) delete next[id as keyof Scores]
    else next[id as keyof Scores] = score
    onBase(next)
  }

  return (
    <div className="grid gap-1">
      {ABILITIES.map(([id, label]) => (
        <AbilityRow key={id} id={id} label={label} facts={facts}>
          <Input
            aria-label={label}
            inputMode="numeric"
            maxLength={2}
            value={base[id]?.toString() ?? ""}
            onChange={(event) => type(id, event.target.value)}
            className="h-7 w-24 text-center tabular-nums"
          />
        </AbilityRow>
      ))}
    </div>
  )
}
