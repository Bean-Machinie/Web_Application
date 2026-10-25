import { SIZES, SPECIES } from "@/lib/character-templates/srd-5-2-1"
import { SPECIES_TRAIT_LIST } from "@/lib/character-templates/srd-5-2-1-origins"
import { BuilderLabel } from "./BuilderLabel"
import { BuilderRow } from "./BuilderRow"
import { BuilderSection } from "./BuilderSection"
import type { SheetActions } from "./character-actions"

// The species in full: its size, Speed and Darkvision, and its traits.
export function QuickSpeciesDetails({ id, actions }: { id: string; actions: SheetActions }) {
  const species = SPECIES.find((option) => option.id === id)!

  return (
    <div className="flex flex-col gap-6 px-4 pb-6">
      <p className="text-muted-foreground text-sm">Your character’s ancestry. It sets size, speed and senses, and adds a few traits of its own.</p>
      <BuilderSection title="Basics">
        <BuilderRow label={<BuilderLabel glossaryKey="size" actions={actions}>Size</BuilderLabel>}>
          {species.sizeChoice ? "Medium or Small, chosen with the species" : SIZES.find((size) => size.id === species.size)!.label}
        </BuilderRow>
        <BuilderRow label={<BuilderLabel glossaryKey="speed" actions={actions}>Speed</BuilderLabel>}>{species.speed} ft</BuilderRow>
        <BuilderRow label={<BuilderLabel glossaryKey="darkvision" actions={actions}>Darkvision</BuilderLabel>}>
          {species.darkvision ? `${species.darkvision} ft` : <span className="text-muted-foreground">None</span>}
        </BuilderRow>
      </BuilderSection>
      <BuilderSection title="Traits">
        {SPECIES_TRAIT_LIST[id].map((trait) => (
          <BuilderRow key={trait.name} label={<span className="text-foreground font-medium">{trait.name}</span>}>
            <span className="text-muted-foreground">{trait.summary}</span>
          </BuilderRow>
        ))}
      </BuilderSection>
    </div>
  )
}
