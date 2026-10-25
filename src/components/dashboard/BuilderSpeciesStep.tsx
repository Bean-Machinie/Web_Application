import { SIZES, SPECIES } from "@/lib/character-templates/srd-5-2-1"
import { SPECIES_TRAITS } from "@/lib/character-templates/srd-5-2-1-glossary"
import { GLOSSARY } from "@/lib/character-templates/srd-5-2-1-glossary"
import { chosenId } from "./ability-facts"
import { BuilderChoiceSelect } from "./BuilderChoiceSelect"
import { BuilderDetail } from "./BuilderDetail"
import { BuilderFeatBox } from "./BuilderFeatBox"
import { BuilderLabel } from "./BuilderLabel"
import { BuilderLayout } from "./BuilderLayout"
import { BuilderRow } from "./BuilderRow"
import type { BuilderProps } from "./builder-types"

const sizeName = (id: string) => SIZES.find((size) => size.id === id)!.label

// Step 3: the species, with its size, Speed, Darkvision and traits. A Human also makes
// their two choices here: the Versatile feat and the Skillful skill. Human and Tiefling
// pick their size, Medium or Small.
export function BuilderSpeciesStep({ actions }: BuilderProps) {
  const species = SPECIES.find((candidate) => candidate.id === chosenId(actions, "species-choice")) ?? null
  const versatile = chosenId(actions, "versatile-feat")

  function choose(id: string) {
    if (id === species?.id) return
    actions.onValue("species-choice", id)
    // A size picked for the old species would stay on the new one.
    actions.onValue("size", null)
  }

  return (
    <BuilderLayout
      options={SPECIES.map((option) => ({ id: option.id, name: option.label, line: `${sizeName(option.size)} · ${option.speed} ft` }))}
      selected={species?.id ?? null}
      onSelect={choose}
    >
      {species ? (
        <BuilderDetail title={species.label} intro={GLOSSARY.species.what} page={SPECIES_TRAITS[species.id].page}>
          <BuilderRow label={<BuilderLabel glossaryKey="size" actions={actions}>Size</BuilderLabel>}>
            {species.sizeChoice ? (
              <BuilderChoiceSelect fieldId="size" actions={actions} placeholder="Choose…" only={["small", "medium"]} />
            ) : (
              sizeName(species.size)
            )}
          </BuilderRow>
          <BuilderRow label={<BuilderLabel glossaryKey="speed" actions={actions}>Speed</BuilderLabel>}>{species.speed} ft</BuilderRow>
          <BuilderRow label={<BuilderLabel glossaryKey="darkvision" actions={actions}>Darkvision</BuilderLabel>}>
            {species.darkvision ? `${species.darkvision} ft` : "None"}
          </BuilderRow>
          <BuilderRow label="Traits">{SPECIES_TRAITS[species.id].traits}</BuilderRow>
          {species.id === "human" && (
            <>
              <BuilderRow label={<BuilderLabel glossaryKey="versatile" fieldId="versatile-feat" actions={actions}>Versatile</BuilderLabel>}>
                <BuilderChoiceSelect fieldId="versatile-feat" actions={actions} placeholder="Choose a feat…" />
              </BuilderRow>
              {versatile && <BuilderFeatBox feat={versatile} abilityFieldId="versatile-feat.ability" actions={actions} />}
              <BuilderRow label={<BuilderLabel glossaryKey="skillful" fieldId="human-skill" actions={actions}>Skillful</BuilderLabel>}>
                <BuilderChoiceSelect fieldId="human-skill" actions={actions} placeholder="Choose a skill…" />
              </BuilderRow>
            </>
          )}
        </BuilderDetail>
      ) : (
        <BuilderDetail title="Choose a species" intro={GLOSSARY.species.what} page={GLOSSARY.species.page} />
      )}
    </BuilderLayout>
  )
}
