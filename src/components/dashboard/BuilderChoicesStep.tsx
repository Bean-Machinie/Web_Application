import { cardsFor } from "@/lib/character-cards"
import { origins } from "@/lib/character-grants"
import { CLASS_BUILD } from "@/lib/character-templates/srd-5-2-1-classes"
import { BuilderFeatsCard } from "./BuilderFeatsCard"
import { BuilderPickCard } from "./BuilderPickCard"
import { BuilderSkillsCard } from "./BuilderSkillsCard"
import type { BuilderProps } from "./builder-types"

// Step 5: everything the class, background and species let the character pick, in one place.
// What shows is what the current character is asked for: each class, background and species
// declares its own choices in the SRD data, and this only lays them out. Skills first, then the
// Origin feats, then the rest side by side.
export function BuilderChoicesStep({ actions }: BuilderProps) {
  const { cls, background, species } = origins(actions)
  const cards = cardsFor(actions)
  const skills = cards.filter((card) => card.decl.kind === "skills")
  const originFeats = cards.filter((card) => card.decl.kind === "feat" && card.decl.category === "origin")
  const rest = cards.filter((card) => card.decl.kind !== "skills" && !originFeats.includes(card))
  const missing = [!cls && "class", !background && "background", !species && "species"].filter(Boolean)

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Skills and feats</h1>
        <p className="text-muted-foreground max-w-2xl text-sm">
          Everything your class, background and species let you pick, in one place. Things you already have are marked, so no pick is wasted.
        </p>
      </div>
      {missing.length > 0 && <p className="text-muted-foreground bg-muted/40 rounded-lg border px-4 py-3 text-sm">Choose your {missing.join(", ")} first: more choices appear with them.</p>}
      {cls && CLASS_BUILD[cls.id].spellcaster && (
        <p className="text-muted-foreground bg-muted/40 rounded-lg border px-4 py-3 text-sm">Spells come later. Choosing cantrips and spells is not in the builder yet.</p>
      )}
      {skills.map((card) => (
        <BuilderSkillsCard key={card.decl.field} card={card} actions={actions} />
      ))}
      <BuilderFeatsCard cards={originFeats.length > 0 || background ? cards : []} actions={actions} />
      <div className="flex flex-wrap gap-4">
        {rest.map((card) => (
          <BuilderPickCard key={card.decl.field} card={card} actions={actions} />
        ))}
      </div>
    </div>
  )
}
