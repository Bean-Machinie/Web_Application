import { Badge } from "@/components/ui/badge"
import { origins } from "@/lib/character-grants"
import { ABILITIES, BACKGROUNDS, SKILLS } from "@/lib/character-templates/srd-5-2-1"
import { CLASS_NOTES } from "@/lib/character-templates/srd-5-2-1-glossary"
import { featById } from "@/lib/character-templates/srd-5-2-1-feats"
import { BACKGROUND_CHOICES } from "@/lib/character-templates/srd-5-2-1-origins"
import { BuilderDetail } from "./BuilderDetail"
import { BuilderLabel } from "./BuilderLabel"
import { BuilderLayout } from "./BuilderLayout"
import { BuilderRow } from "./BuilderRow"
import { BuilderSection } from "./BuilderSection"
import { chooseBackground } from "./builder-choose"
import type { BuilderProps } from "./builder-types"

const abilityName = (id: string) => ABILITIES.find(([other]) => other === id)![1]
const skillName = (id: string) => SKILLS.find(([other]) => other === id)![1]

// Step 2: the background, with what it gets: three abilities to raise (in step 4), two
// skills, a tool, an Origin feat and starting equipment.
export function BuilderBackgroundStep({ actions }: BuilderProps) {
  const { cls, background } = origins(actions)
  const feat = background ? featById(background.feat) : null
  const primary = cls ? cls.primary : []
  const asksTool = background ? (BACKGROUND_CHOICES[background.id]?.length ?? 0) > 0 : false

  return (
    <BuilderLayout
      heading="Backgrounds"
      options={BACKGROUNDS.map((option) => ({
        id: option.id,
        name: option.label,
        line: option.abilities.map((id) => abilityName(id).slice(0, 3)).join(" · "),
        badge: cls && option.abilities.some((id) => primary.includes(id)) ? `Suits ${cls.label}` : undefined,
      }))}
      selected={background?.id ?? null}
      onSelect={(id) => chooseBackground(actions, id)}
      hint={cls ? `Tip: pick a background that raises your class’s primary ability. ${cls.label} uses ${CLASS_NOTES[cls.id].primary}.` : undefined}
    >
      {background ? (
        <BuilderDetail
          kind="Background"
          title={background.label}
          intro="Where your character came from. A background shapes your ability scores and gives you two skills, a tool, an origin feat and starting gear."
          source="Backgrounds p. 83, Feats p. 87"
        >
          <BuilderSection title={`What a ${background.label} gets`}>
            <BuilderRow label={<BuilderLabel glossaryKey="ability-increase" actions={actions}>Ability increase</BuilderLabel>}>
              <span className="flex items-start justify-between gap-3">
                {background.abilities.map(abilityName).join(", ").replace(/, ([^,]*)$/, " or $1")}
                <Badge variant="secondary" className="shrink-0">Split in step 4</Badge>
              </span>
            </BuilderRow>
            <BuilderRow label="Skills">{background.skills.map(skillName).join(" and ")}</BuilderRow>
            <BuilderRow label={<BuilderLabel glossaryKey="tool" actions={actions}>Tool</BuilderLabel>}>
              <span className="flex items-start justify-between gap-3">
                {background.tool}
                {asksTool && <Badge variant="secondary" className="shrink-0">Step 5</Badge>}
              </span>
            </BuilderRow>
            <BuilderRow label="Equipment">
              <span className="flex items-start justify-between gap-3">
                A kit, or 50 GP
                <Badge variant="secondary" className="shrink-0">Step 6</Badge>
              </span>
            </BuilderRow>
          </BuilderSection>
          <BuilderSection title="Origin feat">
            <div className="bg-muted/40 mt-1 rounded-lg border px-4 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold">{background.feat}</span>
                <span className="text-muted-foreground text-xs">Origin feat</span>
              </div>
              {feat && <p className="text-muted-foreground mt-1 text-sm">{feat.benefit}</p>}
            </div>
          </BuilderSection>
        </BuilderDetail>
      ) : (
        <BuilderDetail kind="Background" title="Choose a background" intro="A background is the place and occupation that were most formative before your character became an adventurer." source="Backgrounds p. 83" />
      )}
    </BuilderLayout>
  )
}
