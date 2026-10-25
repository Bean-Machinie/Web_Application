import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ABILITIES, CLASSES } from "@/lib/character-templates/srd-5-2-1"
import { CLASS_NOTES, GLOSSARY } from "@/lib/character-templates/srd-5-2-1-glossary"
import { readStat } from "@/lib/character-values"
import { abilityFacts } from "./ability-facts"
import { BuilderDetail } from "./BuilderDetail"
import { BuilderLabel } from "./BuilderLabel"
import { BuilderLayout } from "./BuilderLayout"
import { BuilderRow } from "./BuilderRow"
import { BuilderSkillPicks } from "./BuilderSkillPicks"
import type { BuilderProps } from "./builder-types"

const LEVELS = Array.from({ length: 20 }, (_, index) => index + 1)
const nameOf = (id: string) => ABILITIES.find(([other]) => other === id)![1]

// Step 1: the class, with its hit die, primary ability, saving throws and skill choices.
export function BuilderClassStep({ actions }: BuilderProps) {
  const { cls, background } = abilityFacts(actions)
  const level = readStat(actions.values.level?.value)

  function choose(id: string) {
    if (id === cls?.id) return
    actions.onValue("character-class", id)
    // The skills picked came from the old class’s list.
    actions.onValue("class-skills", null)
  }

  return (
    <BuilderLayout
      options={CLASSES.map((option) => ({ id: option.id, name: option.label, line: `d${option.hitDie} · ${CLASS_NOTES[option.id].primary}` }))}
      selected={cls?.id ?? null}
      onSelect={choose}
    >
      {cls ? (
        <BuilderDetail title={cls.label} intro={GLOSSARY.class.what} page={cls.page}>
          <BuilderRow label={<BuilderLabel glossaryKey="hit-die" actions={actions}>Hit die</BuilderLabel>}>d{cls.hitDie}</BuilderRow>
          <BuilderRow label="Primary ability">{CLASS_NOTES[cls.id].primary}</BuilderRow>
          <BuilderRow label={<BuilderLabel glossaryKey="saving-throws" actions={actions}>Saving throws</BuilderLabel>}>
            {cls.saves.map(nameOf).join(", ")}
          </BuilderRow>
          <BuilderRow label={<BuilderLabel glossaryKey="level" actions={actions}>Level</BuilderLabel>}>
            <Select value={level?.toString() ?? ""} onValueChange={(next) => actions.onValue("level", Number(next))}>
              <SelectTrigger size="sm" aria-label="Level" className="w-24">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                {LEVELS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </BuilderRow>
          <BuilderSkillPicks cls={cls} background={background} actions={actions} />
        </BuilderDetail>
      ) : (
        <BuilderDetail title="Choose a class" intro={GLOSSARY.class.what} page={GLOSSARY.class.page} />
      )}
    </BuilderLayout>
  )
}
