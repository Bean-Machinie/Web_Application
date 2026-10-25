import { Minus, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { origins } from "@/lib/character-grants"
import { ABILITIES, CLASSES } from "@/lib/character-templates/srd-5-2-1"
import { CLASS_BUILD } from "@/lib/character-templates/srd-5-2-1-classes"
import type { ClassBuild } from "@/lib/character-templates/srd-5-2-1-classes"
import { CLASS_NOTES } from "@/lib/character-templates/srd-5-2-1-glossary"
import { readStat } from "@/lib/character-values"
import { BuilderDetail } from "./BuilderDetail"
import { BuilderLabel } from "./BuilderLabel"
import { BuilderLayout } from "./BuilderLayout"
import { BuilderRow } from "./BuilderRow"
import { BuilderSection } from "./BuilderSection"
import { clearFields } from "./builder-clear"
import type { BuilderProps } from "./builder-types"
import { applyKits, chosenKits } from "./character-kits"

const nameOf = (id: string) => ABILITIES.find(([other]) => other === id)![1]

const MARTIAL = {
  all: "Martial weapons",
  light: "Martial weapons that have the Light property",
  "finesse-light": "Martial weapons that have the Finesse or Light property",
}

const weaponsText = ({ weapons }: ClassBuild) =>
  weapons.martial ? `${weapons.simple ? "Simple and " : ""}${MARTIAL[weapons.martial]}` : "Simple weapons"

// Everything picked for the old class, which the new one cannot use.
const CLASS_FIELDS = ["class-skills", "class-style", "class-masteries", "class-expertise", "class-order", "class-invocation", "class-tools", "equipment-class"]

// Step 1: the class, with what it gets and the features it has at level 1.
export function BuilderClassStep({ actions }: BuilderProps) {
  const { cls } = origins(actions)
  const build = cls ? CLASS_BUILD[cls.id] : null
  const level = readStat(actions.values.level?.value)

  function choose(id: string) {
    if (id === cls?.id) return
    actions.onValue("character-class", id)
    clearFields(actions, CLASS_FIELDS)
    // Whatever the old class’s kit put on the sheet goes with it.
    const { backgroundKit } = chosenKits(actions)
    applyKits(actions, backgroundKit ? [backgroundKit] : [], {}, id)
    // A new character starts at level 1 (p. 19).
    if (level === null) actions.onValue("level", 1)
  }

  const setLevel = (next: number) => actions.onValue("level", Math.min(Math.max(next, 1), 20))
  const choiceTitles = build ? build.choices.map((choice) => choice.title) : []

  return (
    <BuilderLayout
      heading={`${CLASSES.length} classes`}
      options={CLASSES.map((option) => ({
        id: option.id,
        name: option.label,
        line: `d${option.hitDie} · ${CLASS_BUILD[option.id].likes} · ${CLASS_BUILD[option.id].complexity}`,
      }))}
      selected={cls?.id ?? null}
      onSelect={choose}
    >
      {cls && build ? (
        <BuilderDetail kind="Class" title={cls.label} intro={`Likes ${build.likes.toLowerCase()}.`} source={`${cls.label}, p. ${cls.page}`}>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Complexity: {build.complexity}</Badge>
            <Badge variant="outline">Primary: {CLASS_NOTES[cls.id].primary}</Badge>
          </div>
          <div className="bg-muted/40 flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
            <div className="flex flex-col">
              <span className="text-sm font-medium">Starting level</span>
              <span className="text-muted-foreground text-xs">Most campaigns start at level 1. Ask your GM.</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="size-8" aria-label="Lower level" disabled={(level ?? 1) <= 1} onClick={() => setLevel((level ?? 1) - 1)}>
                <Minus />
              </Button>
              <span className="w-6 text-center text-lg font-semibold tabular-nums">{level ?? 1}</span>
              <Button variant="outline" size="icon" className="size-8" aria-label="Raise level" disabled={(level ?? 1) >= 20} onClick={() => setLevel((level ?? 1) + 1)}>
                <Plus />
              </Button>
            </div>
          </div>

          <BuilderSection title={`What a ${cls.label} gets`}>
            <BuilderRow label={<BuilderLabel glossaryKey="hit-die" actions={actions}>Hit Point Die</BuilderLabel>}>d{cls.hitDie} per {cls.label} level</BuilderRow>
            <BuilderRow label={<BuilderLabel glossaryKey="saving-throws" actions={actions}>Saving throws</BuilderLabel>}>{cls.saves.map(nameOf).join(" and ")}</BuilderRow>
            <BuilderRow label="Armor training">{build.armor}</BuilderRow>
            <BuilderRow label="Weapons">{weaponsText(build)}</BuilderRow>
            {build.tools.length > 0 && <BuilderRow label="Tools">{build.tools.join(", ")}</BuilderRow>}
            <BuilderRow label="Skills">
              Choose {cls.skillCount} of {cls.skills?.length ?? "any"}
              <span className="text-muted-foreground text-xs"> · in step 5, once your background’s skills are known</span>
            </BuilderRow>
          </BuilderSection>

          <BuilderSection title="At level 1">
            {build.features.map((feature) => {
              const asks = choiceTitles.some((title) => feature.name.startsWith(title) || title.startsWith(feature.name))
              const later = feature.name === "Spellcasting" || feature.name === "Pact Magic"
              return (
                <BuilderRow key={feature.name} label={<span className="text-foreground font-medium">{feature.name}</span>}>
                  <span className="flex items-start justify-between gap-3">
                    <span className="text-muted-foreground">{feature.summary}</span>
                    {asks && <Badge variant="secondary" className="shrink-0">Step 5</Badge>}
                    {later && <Badge variant="secondary" className="shrink-0">Later</Badge>}
                  </span>
                </BuilderRow>
              )
            })}
          </BuilderSection>
        </BuilderDetail>
      ) : (
        <BuilderDetail kind="Class" title="Choose a class" intro="A class is your character’s vocation, talents and favoured tactics." source="Character Creation, p. 19" />
      )}
    </BuilderLayout>
  )
}
