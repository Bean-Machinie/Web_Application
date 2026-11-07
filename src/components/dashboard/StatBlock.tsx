import type { ReactNode } from "react"
import { identityText, labelLines } from "@/lib/stat-block-format"
import type { StatBlock as StatBlockData } from "@/lib/stat-block-types"
import { StatBlockAbilities } from "./StatBlockAbilities"
import { StatBlockKeyStats } from "./StatBlockKeyStats"
import { StatBlockSection } from "./StatBlockSection"
import { StatBlockSource } from "./StatBlockSource"
import { useRuleLink } from "./useRuleLink"

type Props = {
  // Left out where the page already shows the name, such as a creature's own page.
  name?: string
  // Beside the name, such as the challenge rating.
  badge?: ReactNode
  block: StatBlockData
  // Where the block was written down, for the line at the foot; left out for a block of one's own.
  source?: { document: string; page: number }
}

// The one stat block, in the 2024 layout: used in the compendium, on a creature's page and in a tab.
export function StatBlock({ name, badge, block, source }: Props) {
  const onRule = useRuleLink()
  const legendary = block.legendaryActions
  const uses = legendary && `Legendary Action Uses: ${legendary.uses}${legendary.usesInLair ? ` (${legendary.usesInLair} in Lair)` : ""}. ${legendary.intro}`

  return (
    <article className="@container flex max-w-prose flex-col gap-4 text-sm">
      <header>
        {name && (
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
            {badge}
          </div>
        )}
        <p className="text-muted-foreground italic">{identityText(block)}</p>
      </header>
      <StatBlockKeyStats block={block} />
      <StatBlockAbilities abilities={block.abilities} />
      <dl className="grid gap-1 leading-relaxed">
        {labelLines(block).map(([label, text]) => (
          <div key={label}>
            <dt className="inline font-semibold">{label} </dt>
            <dd className="inline">{text}</dd>
          </div>
        ))}
      </dl>
      <StatBlockSection title="Traits" items={block.traits} onRule={onRule} />
      <StatBlockSection title="Actions" items={block.actions} onRule={onRule} />
      <StatBlockSection title="Bonus Actions" items={block.bonusActions} onRule={onRule} />
      <StatBlockSection title="Reactions" items={block.reactions} onRule={onRule} />
      <StatBlockSection title="Legendary Actions" items={legendary?.actions ?? []} intro={uses} onRule={onRule} />
      {source && <StatBlockSource source={source} />}
    </article>
  )
}
