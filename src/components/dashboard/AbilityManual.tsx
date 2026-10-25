import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ABILITIES } from "@/lib/character-templates/srd-5-2-1"
import type { AbilityId } from "@/lib/character-templates/srd-5-2-1"
import { toWhole } from "@/lib/character-values"
import type { Scores } from "./ability-scores"

type Props = { current: Scores; onApply: (scores: Scores) => void }

// Type each score, for rolls made elsewhere or scores from a book. Boxes left empty are not touched.
export function AbilityManual({ current, onApply }: Props) {
  const [text, setText] = useState<Record<string, string>>(
    Object.fromEntries(ABILITIES.map(([id]) => [id, current[id]?.toString() ?? ""]))
  )

  function apply() {
    const entries = ABILITIES.flatMap(([id]) => {
      const score = toWhole(text[id])
      return score === null ? [] : [[id as AbilityId, score]]
    })
    onApply(Object.fromEntries(entries))
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        {ABILITIES.map(([id, label]) => (
          <label key={id} className="flex items-center justify-between gap-3 text-sm">
            {label}
            <Input
              inputMode="numeric"
              maxLength={2}
              value={text[id]}
              onChange={(event) => setText((old) => ({ ...old, [id]: event.target.value }))}
              className="w-20 text-center tabular-nums"
            />
          </label>
        ))}
      </div>
      <div className="flex justify-end">
        <Button onClick={apply}>Apply scores</Button>
      </div>
    </div>
  )
}
