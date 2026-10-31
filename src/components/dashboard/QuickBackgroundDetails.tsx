import { abilityName, joinList, skillName } from "@/lib/character-format"
import { BACKGROUNDS } from "@/lib/character-templates/srd-5-2-1"
import { featById } from "@/lib/character-templates/srd-5-2-1-feats"
import { DetailLabel } from "./DetailLabel"
import { DetailRow } from "./DetailRow"
import { DetailSection } from "./DetailSection"
import type { SheetActions } from "./character-actions"

// The background in full: the abilities it raises, two skills, a tool, an Origin feat and gear.
export function QuickBackgroundDetails({ id, actions }: { id: string; actions: SheetActions }) {
  const background = BACKGROUNDS.find((option) => option.id === id)!
  const feat = featById(background.feat)

  return (
    <div className="flex flex-col gap-6 px-4 pb-6">
      <p className="text-muted-foreground text-sm">Where your character came from. It shapes your ability scores and gives you two skills, a tool, an origin feat and starting gear.</p>
      <DetailSection title={`What a ${background.label} gets`}>
        <DetailRow label={<DetailLabel glossaryKey="ability-increase" actions={actions}>Ability increase</DetailLabel>}>
          {joinList(background.abilities.map(abilityName), "or")}
        </DetailRow>
        <DetailRow label="Skills">{joinList(background.skills.map(skillName))}</DetailRow>
        <DetailRow label={<DetailLabel glossaryKey="tool" actions={actions}>Tool</DetailLabel>}>{background.tool}</DetailRow>
        <DetailRow label="Equipment">A kit, or 50 GP</DetailRow>
      </DetailSection>
      <DetailSection title="Origin feat">
        <div className="bg-muted/40 mt-1 rounded-lg border px-4 py-3.5">
          <span className="font-semibold">{background.feat}</span>
          {feat && <p className="text-muted-foreground mt-1 text-sm">{feat.benefit}</p>}
        </div>
      </DetailSection>
    </div>
  )
}
