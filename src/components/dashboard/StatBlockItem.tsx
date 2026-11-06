import type { StatAction } from "@/lib/stat-block-types"
import { StatBlockText } from "./StatBlockText"

type Props = { item: StatAction; onRule: (termId: string) => void }

// "At will: …" for a group of spells; "2/Day Each: …" when it is more than one.
const groupLabel = (frequency: string, count: number) => (frequency === "At will" || count < 2 ? frequency : `${frequency} Each`)

// One trait or action: its name in bold italic, then its text. Spellcasting is its intro and a
// line for each group of spells.
export function StatBlockItem({ item, onRule }: Props) {
  const { spellcasting } = item
  return (
    <div className="leading-relaxed">
      <span className="font-semibold italic">{item.usage ? `${item.name} (${item.usage}).` : `${item.name}.`}</span>{" "}
      {spellcasting ? (
        <>
          <StatBlockText text={spellcasting.intro} onRule={onRule} />
          {spellcasting.groups.map((group) => (
            <span key={group.frequency} className="block">
              {groupLabel(group.frequency, group.spells.length)}: {group.spells.join(", ")}
            </span>
          ))}
        </>
      ) : (
        <StatBlockText text={item.text} onRule={onRule} />
      )}
    </div>
  )
}
