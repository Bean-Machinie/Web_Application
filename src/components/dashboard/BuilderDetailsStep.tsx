import { User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ALIGNMENTS } from "@/lib/character-templates/srd-5-2-1"
import { BACKSTORY } from "@/lib/character-templates/srd-5-2-1-backstory"
import { readLine } from "@/lib/character-values"
import type { Character } from "@/lib/characters"
import { cn } from "@/lib/utils"
import { BuilderLabel } from "./BuilderLabel"
import type { BuilderProps } from "./builder-types"
import { ImageFieldEditor } from "./ImageFieldEditor"

const CARD = "bg-card rounded-lg border p-5 shadow-xs"
const AXES = ["Lawful", "Neutral", "Chaotic"]
const MORALS = ["Good", "Neutral", "Evil"]

// Step 7: the name, portrait and concept, the alignment on its grid, and the backstory
// questions, which are kept in the Notes tab. Nothing is chosen for the player.
export function BuilderDetailsStep({ actions, sheet, character, userId }: BuilderProps) {
  const alignment = readLine(actions.values.alignment?.value)

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Who is your character?</h1>
        <p className="text-muted-foreground text-sm">Everything here can be changed later on the sheet.</p>
      </div>

      <section aria-label="Identity" className={cn(CARD, "flex flex-wrap gap-6")}>
        <div className="shrink-0 [--image-size:10rem]">
          <ImageFieldEditor
            value={character.portrait}
            label="Portrait"
            fallback={<User className="size-8" />}
            context={{ folder: userId, entryId: character.id }}
            onChange={(value) => sheet.edit("portrait", value as Character["portrait"])}
          />
        </div>
        <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-3.5">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Name
            <Input defaultValue={character.name === "Untitled character" ? "" : character.name} placeholder="Mira Vale" maxLength={80} onBlur={(event) => event.target.value.trim() && void sheet.edit("name", event.target.value.trim())} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            <span>Concept <span className="text-muted-foreground font-normal">· optional, one line</span></span>
            <Input defaultValue={character.concept} placeholder="Disgraced captain looking for a war worth fighting" maxLength={140} onBlur={(event) => void sheet.edit("concept", event.target.value.trim())} />
          </label>
        </div>
      </section>

      <section aria-label="Alignment" className={CARD}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold">
            <BuilderLabel glossaryKey="alignment" actions={actions}>Alignment</BuilderLabel>
          </h2>
          <span className="text-muted-foreground text-xs">Your character’s moral compass. Check with your GM before picking an evil one.</span>
        </div>
        <div className="mt-4 grid grid-cols-[5rem_repeat(3,minmax(0,1fr))] items-center gap-2">
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
                      "focus-visible:ring-ring h-10 rounded-lg border text-sm outline-none focus-visible:ring-2",
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

      <section aria-label="Backstory prompts" className={CARD}>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-base font-semibold">Backstory prompts</h2>
          <span className="text-muted-foreground text-xs">Optional · saved to Notes</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {BACKSTORY.map((prompt, index) => (
            <label key={prompt.label} className="flex flex-col gap-1.5 text-sm">
              {prompt.question}
              <Input
                defaultValue={readLine(actions.values[`backstory.${index + 1}`]?.value)}
                maxLength={300}
                onBlur={(event) => actions.onValue(`backstory.${index + 1}`, event.target.value.trim())}
              />
            </label>
          ))}
        </div>
      </section>
      <p className="text-muted-foreground text-xs">SRD 5.2.1 · Character creation, Alignment p. 21, Imagine Your Past p. 20</p>
    </div>
  )
}
