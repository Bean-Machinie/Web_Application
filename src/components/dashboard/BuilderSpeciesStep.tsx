import { Badge } from "@/components/ui/badge"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { chosenOption, origins } from "@/lib/character-grants"
import { SIZES, SPECIES } from "@/lib/character-templates/srd-5-2-1"
import { SPECIES_TRAIT_LIST } from "@/lib/character-templates/srd-5-2-1-origins"
import { SPECIES_TRAITS } from "@/lib/character-templates/srd-5-2-1-glossary"
import { BuilderDetail } from "./BuilderDetail"
import { BuilderLabel } from "./BuilderLabel"
import { BuilderLayout } from "./BuilderLayout"
import { BuilderRow } from "./BuilderRow"
import { BuilderSection } from "./BuilderSection"
import { clearFields } from "./builder-clear"
import type { BuilderProps } from "./builder-types"

const sizeName = (id: string) => SIZES.find((size) => size.id === id)!.label
// Step 3: the species, with its size, Speed, Darkvision and traits. Human and Tiefling pick
// Medium or Small here; the choices the traits ask for are in step 5.
export function BuilderSpeciesStep({ actions }: BuilderProps) {
  const { species } = origins(actions)
  const sizeId = chosenOption(actions, "size")?.id

  function choose(id: string) {
    if (id === species?.id) return
    actions.onValue("species-choice", id)
    // What the old species asked for, and a size picked for it, are not the new one’s.
    clearFields(actions, ["size", "species-option", "species-skill", "species-ability", "species-feat", "species-feat.ability"])
  }

  return (
    <BuilderLayout
      heading="Species"
      options={SPECIES.map((option) => ({
        id: option.id,
        name: option.label,
        line: [option.sizeChoice ? "Medium or Small" : sizeName(option.size), `${option.speed} ft`, option.darkvision ? "Darkvision" : null].filter(Boolean).join(" · "),
      }))}
      selected={species?.id ?? null}
      onSelect={choose}
    >
      {species ? (
        <BuilderDetail
          kind="Species"
          title={species.label}
          intro="Your character’s ancestry. It sets size, speed and senses, and adds a few traits of its own."
          source={`${species.label}, p. ${SPECIES_TRAITS[species.id].page}`}
        >
          <BuilderSection title="Basics">
            <BuilderRow label={<BuilderLabel glossaryKey="size" actions={actions}>Size</BuilderLabel>}>
              {species.sizeChoice ? (
                <span className="flex flex-wrap items-center gap-3">
                  <ToggleGroup type="single" variant="outline" size="sm" value={sizeId ?? ""} onValueChange={(next) => next && actions.onValue("size", next)} aria-label="Size">
                    <ToggleGroupItem value="medium" className="px-4">Medium</ToggleGroupItem>
                    <ToggleGroupItem value="small" className="px-4">Small</ToggleGroupItem>
                  </ToggleGroup>
                  <span className="text-muted-foreground text-xs">Chosen with the species. Medium is about 4–7 ft, Small about 2–4 ft.</span>
                </span>
              ) : (
                sizeName(species.size)
              )}
            </BuilderRow>
            <BuilderRow label={<BuilderLabel glossaryKey="speed" actions={actions}>Speed</BuilderLabel>}>{species.speed} ft</BuilderRow>
            <BuilderRow label={<BuilderLabel glossaryKey="darkvision" actions={actions}>Darkvision</BuilderLabel>}>
              {species.darkvision ? `${species.darkvision} ft` : <span className="text-muted-foreground">None</span>}
            </BuilderRow>
          </BuilderSection>
          <BuilderSection title="Traits">
            {SPECIES_TRAIT_LIST[species.id].map((trait) => (
              <BuilderRow key={trait.name} label={<span className="text-foreground font-medium">{trait.name}</span>}>
                <span className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">{trait.summary}</span>
                  {trait.choice && <Badge variant="secondary" className="shrink-0">Step 5</Badge>}
                </span>
              </BuilderRow>
            ))}
          </BuilderSection>
        </BuilderDetail>
      ) : (
        <BuilderDetail kind="Species" title="Choose a species" intro="A species is the set of traits your character has from their ancestry." source="Character Origins, p. 83" />
      )}
    </BuilderLayout>
  )
}
