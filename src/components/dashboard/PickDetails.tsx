import { Input } from "@/components/ui/input"
import { ALIGNMENTS } from "@/lib/character-templates/srd-5-2-1"
import { BACKSTORY } from "@/lib/character-templates/srd-5-2-1-backstory"
import { readLine } from "@/lib/character-values"
import type { Character } from "@/lib/characters"
import { cn } from "@/lib/utils"
import type { SheetActions } from "./character-actions"

type Props = { actions: SheetActions; character: Character; onConcept: (concept: string) => void }

const AXES = ["Lawful", "Neutral", "Chaotic"]
const MORALS = ["Good", "Neutral", "Evil"]

// The concept, the alignment on its grid with nothing chosen for the player, and the backstory
// questions, which are kept in the Notes tab. Each is saved as it is changed.
export function PickDetails({ actions, character, onConcept }: Props) {
  const alignment = readLine(actions.values.alignment?.value)

  return (
    <div className="flex flex-col gap-6">
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        <span>Concept <span className="text-muted-foreground font-normal">· optional, one line</span></span>
        <Input defaultValue={character.concept} placeholder="Disgraced captain looking for a war worth fighting" maxLength={140} onBlur={(event) => onConcept(event.target.value.trim())} />
      </label>

      <section aria-label="Alignment" className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">Alignment</h3>
        <div className="grid grid-cols-[4.5rem_repeat(3,minmax(0,1fr))] items-center gap-1.5">
          <span />
          {AXES.map((axis) => (
            <span key={axis} className="text-muted-foreground text-center text-xs">{axis}</span>
          ))}
          {MORALS.map((moral, row) => (
            <div key={moral} className="contents">
              <span className="text-muted-foreground text-xs">{moral}</span>
              {AXES.map((_, column) => {
                const name = ALIGNMENTS[row * 3 + column]
                return (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={alignment === name}
                    onClick={() => actions.onValue("alignment", name)}
                    className={cn(
                      "focus-visible:ring-ring h-9 truncate rounded-lg border px-1 text-xs outline-none focus-visible:ring-2",
                      alignment === name ? "border-foreground bg-accent font-medium" : "hover:bg-accent/50"
                    )}
                  >
                    {name}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Backstory prompts" className="flex flex-col gap-3">
        <h3 className="text-sm font-medium">Backstory <span className="text-muted-foreground font-normal">· optional, saved to Notes</span></h3>
        {BACKSTORY.map((prompt, index) => (
          <label key={prompt.label} className="flex flex-col gap-1.5 text-sm">
            {prompt.question}
            <Input defaultValue={readLine(actions.values[`backstory.${index + 1}`]?.value)} maxLength={300} onBlur={(event) => actions.onValue(`backstory.${index + 1}`, event.target.value.trim())} />
          </label>
        ))}
      </section>
    </div>
  )
}
