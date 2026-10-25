import { Badge } from "@/components/ui/badge"
import { ABILITIES, CLASSES, SKILLS } from "@/lib/character-templates/srd-5-2-1"
import { CLASS_BUILD } from "@/lib/character-templates/srd-5-2-1-classes"
import { CLASS_NOTES } from "@/lib/character-templates/srd-5-2-1-glossary"
import { BuilderLabel } from "./BuilderLabel"
import { BuilderRow } from "./BuilderRow"
import { BuilderSection } from "./BuilderSection"
import type { SheetActions } from "./character-actions"
import { weaponsText } from "./class-text"

const abilityName = (id: string) => ABILITIES.find(([other]) => other === id)![1]
const skillName = (id: string) => SKILLS.find(([other]) => other === id)![1]

// The class in full: what it gets and its level 1 features.
export function QuickClassDetails({ id, actions }: { id: string; actions: SheetActions }) {
  const cls = CLASSES.find((option) => option.id === id)!
  const build = CLASS_BUILD[id]

  return (
    <div className="flex flex-col gap-6 px-4 pb-6">
      <p className="text-muted-foreground text-sm">Likes {build.likes.toLowerCase()}.</p>
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Complexity: {build.complexity}</Badge>
        <Badge variant="outline">Primary: {CLASS_NOTES[id].primary}</Badge>
      </div>
      <BuilderSection title={`What a ${cls.label} gets`}>
        <BuilderRow label={<BuilderLabel glossaryKey="hit-die" actions={actions}>Hit Point Die</BuilderLabel>}>d{cls.hitDie} per {cls.label} level</BuilderRow>
        <BuilderRow label={<BuilderLabel glossaryKey="saving-throws" actions={actions}>Saving throws</BuilderLabel>}>{cls.saves.map(abilityName).join(" and ")}</BuilderRow>
        <BuilderRow label="Armor training">{build.armor}</BuilderRow>
        <BuilderRow label="Weapons">{weaponsText(build)}</BuilderRow>
        {build.tools.length > 0 && <BuilderRow label="Tools">{build.tools.join(", ")}</BuilderRow>}
        <BuilderRow label="Skills">
          Choose {cls.skillCount}{cls.skills ? ` of ${cls.skills.map(skillName).join(", ")}` : " of any"}
        </BuilderRow>
      </BuilderSection>
      <BuilderSection title="At level 1">
        {build.features.map((feature) => (
          <BuilderRow key={feature.name} label={<span className="text-foreground font-medium">{feature.name}</span>}>
            <span className="text-muted-foreground">{feature.summary}</span>
          </BuilderRow>
        ))}
      </BuilderSection>
    </div>
  )
}
