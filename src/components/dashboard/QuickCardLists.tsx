import type { CardModel } from "@/lib/quick-card"
import { QuickValue } from "./QuickValue"

type Props = { shown: CardModel; base: CardModel }

// The feats, each with where it came from, and the skills in two columns with their bonus.
export function QuickCardLists({ shown, base }: Props) {
  return (
    <div className="flex flex-col gap-3 max-[999px]:hidden">
      <section className="flex flex-col gap-1">
        <h3 className="text-muted-foreground text-xs font-medium">Feats</h3>
        {shown.feats.length === 0 && <p className="text-sm">—</p>}
        <ul className="flex flex-col gap-0.5">
          {shown.feats.map((feat) => (
            <li key={`${feat.name}${feat.source}`} className="text-sm">
              <QuickValue value={feat.name} changed={!base.feats.some((other) => other.name === feat.name && other.source === feat.source)} className="-ml-1" />
              <span className="text-muted-foreground text-xs"> · {feat.source}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="flex flex-col gap-1">
        <h3 className="text-muted-foreground text-xs font-medium">Skills</h3>
        {shown.skills.length === 0 && <p className="text-sm">—</p>}
        <ul className="grid grid-cols-2 gap-x-4 gap-y-0.5">
          {shown.skills.map((skill) => (
            <li key={skill.name} className="flex items-baseline justify-between gap-2 text-sm">
              <span className="truncate">{skill.name}</span>
              <QuickValue value={skill.bonus} changed={!base.skills.some((other) => other.name === skill.name && other.bonus === skill.bonus)} className="text-muted-foreground" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
