import { parseList, parseSkills, skillsText } from "@/lib/stat-block-format"
import type { StatBlock } from "@/lib/stat-block-types"
import { StatListInput } from "./StatListInput"

type Props = { block: StatBlock; onChange: (block: StatBlock) => void }

// The label lines: skills, what it is weak to, resists or is immune to, gear and languages.
export function StatBlockListsForm({ block, onChange }: Props) {
  const list = (label: string, items: string[], apply: (next: string[]) => Partial<StatBlock>) => (
    <StatListInput label={label} text={items.join(", ")} onCommit={(text) => onChange({ ...block, ...apply(parseList(text)) })} />
  )
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <StatListInput label="Skills (Stealth +6, …)" text={skillsText(block.skills)} onCommit={(text) => onChange({ ...block, skills: parseSkills(text) })} className="sm:col-span-2" />
      {list("Vulnerabilities", block.vulnerabilities, (vulnerabilities) => ({ vulnerabilities }))}
      {list("Resistances", block.resistances, (resistances) => ({ resistances }))}
      {list("Damage immunities", block.immunities.damage, (damage) => ({ immunities: { ...block.immunities, damage } }))}
      {list("Condition immunities", block.immunities.conditions, (conditions) => ({ immunities: { ...block.immunities, conditions } }))}
      {list("Gear", block.gear, (gear) => ({ gear }))}
      <StatListInput label="Languages" text={block.languages} onCommit={(languages) => onChange({ ...block, languages })} />
    </div>
  )
}
