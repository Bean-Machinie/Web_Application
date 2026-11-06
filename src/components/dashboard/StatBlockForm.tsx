import type { StatAction, StatBlock } from "@/lib/stat-block-types"
import { StatBlockAbilitiesForm } from "./StatBlockAbilitiesForm"
import { StatBlockBasicsForm } from "./StatBlockBasicsForm"
import { StatBlockListsForm } from "./StatBlockListsForm"
import { StatItemsForm } from "./StatItemsForm"

type Props = { block: StatBlock; onChange: (block: StatBlock) => void }

const SECTIONS: [title: string, key: "traits" | "actions" | "bonusActions" | "reactions"][] = [
  ["Traits", "traits"],
  ["Actions", "actions"],
  ["Bonus Actions", "bonusActions"],
  ["Reactions", "reactions"],
]

// Where the GM changes their copy of the stat block. Everything saves as it is typed.
export function StatBlockForm({ block, onChange }: Props) {
  const legendary = block.legendaryActions
  const setLegendary = (actions: StatAction[]) => onChange({ ...block, legendaryActions: legendary && { ...legendary, actions } })
  return (
    <div className="flex max-w-prose flex-col gap-4">
      <StatBlockBasicsForm block={block} onChange={onChange} />
      <StatBlockAbilitiesForm abilities={block.abilities} onChange={(abilities) => onChange({ ...block, abilities })} />
      <StatBlockListsForm block={block} onChange={onChange} />
      {SECTIONS.map(([title, key]) => (
        <StatItemsForm key={key} title={title} items={block[key]} onChange={(items) => onChange({ ...block, [key]: items })} />
      ))}
      {legendary && <StatItemsForm title="Legendary Actions" items={legendary.actions} onChange={setLegendary} />}
    </div>
  )
}
