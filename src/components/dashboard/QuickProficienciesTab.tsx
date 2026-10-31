import type { CardModel } from "@/lib/quick-card"
import { has, NONE } from "@/lib/quick-card-format"
import { cn } from "@/lib/utils"
import { QuickProficiencyRow } from "./QuickProficiencyRow"
import { QuickSectionHeader } from "./QuickSectionHeader"
import { QuickValue } from "./QuickValue"

type Props = { shown: CardModel; base: CardModel; onPick: ((pick: string) => void) | null }

// Saving throws with a dot where proficient, the skills in two columns, then tools, languages,
// armor training and weapons as short rows.
export function QuickProficienciesTab({ shown, base, onPick }: Props) {
  const now = shown.proficiency
  const before = base.proficiency
  const edit = (pick: string | null) => (onPick && pick ? () => onPick(pick) : null)
  const list = (items: string[]) => items.join(", ") || NONE

  return (
    <div className="flex flex-col gap-4">
      <section aria-label="Saving throws" className="flex flex-col gap-1">
        <QuickSectionHeader title="Saving throws" />
        <ul className="grid grid-cols-2 gap-x-4 gap-y-0.5">
          {now.saves.map((save) => (
            <li key={save.label} className="flex items-center gap-2 text-sm">
              <span aria-label={save.proficient ? "Proficient" : "Not proficient"} className={cn("size-2 shrink-0 rounded-full border", save.proficient ? "bg-foreground border-foreground" : "border-muted-foreground/50")} />
              <span className="flex-1 truncate">{save.label}</span>
              <QuickValue value={save.bonus} changed={!has(before.saves, save)} className="text-muted-foreground" />
            </li>
          ))}
        </ul>
      </section>
      <section aria-label="Skills" className="flex flex-col gap-1">
        <QuickSectionHeader title="Skills" onEdit={edit(now.picks.skills)} />
        {shown.skills.length === 0 && <p className="text-sm">{NONE}</p>}
        <ul className="grid grid-cols-2 gap-x-4 gap-y-0.5">
          {shown.skills.map((skill) => (
            <li key={skill.name} className="flex items-baseline justify-between gap-2 text-sm">
              <span className="truncate">{skill.name}</span>
              <QuickValue value={skill.bonus} changed={!has(base.skills, skill)} className="text-muted-foreground" />
            </li>
          ))}
        </ul>
      </section>
      <section aria-label="Training" className="flex flex-col gap-1">
        <QuickSectionHeader title="Tools, languages and training" />
        <dl className="flex flex-col gap-1">
          <QuickProficiencyRow label="Tools" value={list(now.tools)} changed={list(now.tools) !== list(before.tools)} onEdit={edit(now.picks.tools)} />
          <QuickProficiencyRow label="Languages" value={list(now.languages)} changed={list(now.languages) !== list(before.languages)} onEdit={edit(now.picks.languages)} />
          <QuickProficiencyRow label="Armor" value={now.armor} changed={now.armor !== before.armor} />
          <QuickProficiencyRow label="Weapons" value={now.weapons} changed={now.weapons !== before.weapons} />
        </dl>
      </section>
    </div>
  )
}
