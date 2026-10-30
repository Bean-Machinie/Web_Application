import { SIZES, SPECIES } from "@/lib/character-templates/srd-5-2-1"
import { SPECIES_TRAIT_LIST } from "@/lib/character-templates/srd-5-2-1-origins"
import { DetailLabel } from "./DetailLabel"
import { DetailRow } from "./DetailRow"
import { DetailSection } from "./DetailSection"
import type { SheetActions } from "./character-actions"

// The species in full: its size, Speed and Darkvision, and its traits.
export function QuickSpeciesDetails({ id, actions }: { id: string; actions: SheetActions }) {
  const species = SPECIES.find((option) => option.id === id)!

  return (
    <div className="flex flex-col gap-6 px-4 pb-6">
      <p className="text-muted-foreground text-sm">Your character’s ancestry. It sets size, speed and senses, and adds a few traits of its own.</p>
      <DetailSection title="Basics">
        <DetailRow label={<DetailLabel glossaryKey="size" actions={actions}>Size</DetailLabel>}>
          {species.sizeChoice ? "Medium or Small, chosen with the species" : SIZES.find((size) => size.id === species.size)!.label}
        </DetailRow>
        <DetailRow label={<DetailLabel glossaryKey="speed" actions={actions}>Speed</DetailLabel>}>{species.speed} ft</DetailRow>
        <DetailRow label={<DetailLabel glossaryKey="darkvision" actions={actions}>Darkvision</DetailLabel>}>
          {species.darkvision ? `${species.darkvision} ft` : <span className="text-muted-foreground">None</span>}
        </DetailRow>
      </DetailSection>
      <DetailSection title="Traits">
        {SPECIES_TRAIT_LIST[id].map((trait) => (
          <DetailRow key={trait.name} label={<span className="text-foreground font-medium">{trait.name}</span>}>
            <span className="text-muted-foreground">{trait.summary}</span>
          </DetailRow>
        ))}
      </DetailSection>
    </div>
  )
}
