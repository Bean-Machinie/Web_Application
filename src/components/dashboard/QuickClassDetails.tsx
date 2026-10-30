import { Badge } from "@/components/ui/badge"
import { ABILITIES, CLASSES, SKILLS } from "@/lib/character-templates/srd-5-2-1"
import { CLASS_BUILD } from "@/lib/character-templates/srd-5-2-1-classes"
import { CLASS_NOTES } from "@/lib/character-templates/srd-5-2-1-glossary"
import { DetailLabel } from "./DetailLabel"
import { DetailRow } from "./DetailRow"
import { DetailSection } from "./DetailSection"
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
      <DetailSection title={`What a ${cls.label} gets`}>
        <DetailRow label={<DetailLabel glossaryKey="hit-die" actions={actions}>Hit Point Die</DetailLabel>}>d{cls.hitDie} per {cls.label} level</DetailRow>
        <DetailRow label={<DetailLabel glossaryKey="saving-throws" actions={actions}>Saving throws</DetailLabel>}>{cls.saves.map(abilityName).join(" and ")}</DetailRow>
        <DetailRow label="Armor training">{build.armor}</DetailRow>
        <DetailRow label="Weapons">{weaponsText(build)}</DetailRow>
        {build.tools.length > 0 && <DetailRow label="Tools">{build.tools.join(", ")}</DetailRow>}
        <DetailRow label="Skills">
          Choose {cls.skillCount}{cls.skills ? ` of ${cls.skills.map(skillName).join(", ")}` : " of any"}
        </DetailRow>
      </DetailSection>
      <DetailSection title="At level 1">
        {build.features.map((feature) => (
          <DetailRow key={feature.name} label={<span className="text-foreground font-medium">{feature.name}</span>}>
            <span className="text-muted-foreground">{feature.summary}</span>
          </DetailRow>
        ))}
      </DetailSection>
    </div>
  )
}
