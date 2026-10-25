import { SKILLS } from "@/lib/character-templates/srd-5-2-1"
import { BACKGROUNDS } from "@/lib/character-templates/srd-5-2-1"
import { GLOSSARY } from "@/lib/character-templates/srd-5-2-1-glossary"
import { abilityFacts } from "./ability-facts"
import { BuilderDetail } from "./BuilderDetail"
import { BuilderFeatBox } from "./BuilderFeatBox"
import { BuilderIncreaseRows } from "./BuilderIncreaseRows"
import { BuilderLabel } from "./BuilderLabel"
import { BuilderLayout } from "./BuilderLayout"
import { BuilderRow } from "./BuilderRow"
import type { BuilderProps } from "./builder-types"

const skillName = (id: string) => SKILLS.find(([other]) => other === id)![1]

// Step 2: the background, with its ability increase, its two skills, its tool and its Origin
// feat. The skills, tool and feat are fixed by the background and only read here.
export function BuilderBackgroundStep({ actions }: BuilderProps) {
  const { background, increaseId } = abilityFacts(actions)

  return (
    <BuilderLayout
      options={BACKGROUNDS.map((option) => ({ id: option.id, name: option.label, line: option.feat }))}
      selected={background?.id ?? null}
      onSelect={(id) => actions.onValue("background-choice", id)}
    >
      {background ? (
        <BuilderDetail title={background.label} intro={GLOSSARY.background.what} page={GLOSSARY.background.page}>
          <div className="grid gap-1">
            <p className="text-sm font-medium">
              <BuilderLabel glossaryKey="ability-increase" actions={actions}>Ability increase</BuilderLabel>
            </p>
            <BuilderIncreaseRows key={background.id} background={background} stored={increaseId} actions={actions} />
          </div>
          <BuilderRow label="Skills">{background.skills.map(skillName).join(" and ")}</BuilderRow>
          <BuilderRow label={<BuilderLabel glossaryKey="tool" actions={actions}>Tool</BuilderLabel>}>{background.tool}</BuilderRow>
          <BuilderRow label={<BuilderLabel glossaryKey="origin-feat" actions={actions}>Origin feat</BuilderLabel>}>{background.feat}</BuilderRow>
          <BuilderFeatBox feat={background.feat} abilityFieldId="origin-feat.ability" actions={actions} />
        </BuilderDetail>
      ) : (
        <BuilderDetail title="Choose a background" intro={GLOSSARY.background.what} page={GLOSSARY.background.page} />
      )}
    </BuilderLayout>
  )
}
