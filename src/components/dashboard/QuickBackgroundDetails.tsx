import { ABILITIES, BACKGROUNDS, SKILLS } from "@/lib/character-templates/srd-5-2-1"
import { featById } from "@/lib/character-templates/srd-5-2-1-feats"
import { BuilderLabel } from "./BuilderLabel"
import { BuilderRow } from "./BuilderRow"
import { BuilderSection } from "./BuilderSection"
import type { SheetActions } from "./character-actions"

const abilityName = (id: string) => ABILITIES.find(([other]) => other === id)![1]
const skillName = (id: string) => SKILLS.find(([other]) => other === id)![1]

// The background in full: the abilities it raises, two skills, a tool, an Origin feat and gear.
export function QuickBackgroundDetails({ id, actions }: { id: string; actions: SheetActions }) {
  const background = BACKGROUNDS.find((option) => option.id === id)!
  const feat = featById(background.feat)

  return (
    <div className="flex flex-col gap-6 px-4 pb-6">
      <p className="text-muted-foreground text-sm">Where your character came from. It shapes your ability scores and gives you two skills, a tool, an origin feat and starting gear.</p>
      <BuilderSection title={`What a ${background.label} gets`}>
        <BuilderRow label={<BuilderLabel glossaryKey="ability-increase" actions={actions}>Ability increase</BuilderLabel>}>
          {background.abilities.map(abilityName).join(", ").replace(/, ([^,]*)$/, " or $1")}
        </BuilderRow>
        <BuilderRow label="Skills">{background.skills.map(skillName).join(" and ")}</BuilderRow>
        <BuilderRow label={<BuilderLabel glossaryKey="tool" actions={actions}>Tool</BuilderLabel>}>{background.tool}</BuilderRow>
        <BuilderRow label="Equipment">A kit, or 50 GP</BuilderRow>
      </BuilderSection>
      <BuilderSection title="Origin feat">
        <div className="bg-muted/40 mt-1 rounded-lg border px-4 py-3.5">
          <span className="font-semibold">{background.feat}</span>
          {feat && <p className="text-muted-foreground mt-1 text-sm">{feat.benefit}</p>}
        </div>
      </BuilderSection>
    </div>
  )
}
