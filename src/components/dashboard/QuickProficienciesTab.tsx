import type { CardModel } from "@/lib/quick-card"
import { has, NONE } from "@/lib/quick-card-format"
import { cn } from "@/lib/utils"
import { Languages, Shield, Swords, Wrench } from "lucide-react"
import { useState } from "react"
import { QuickChangeRow } from "./QuickChangeRow"
import { QuickEditButton } from "./QuickEditButton"
import { QuickSection } from "./QuickSection"
import { QuickValue } from "./QuickValue"

type Props = { shown: CardModel; base: CardModel; onPick: ((pick: string) => void) | null }

// Saving throws with a dot where proficient, the skills in two columns, then tools, languages,
// armor training and weapons as short rows.
export function QuickProficienciesTab({ shown, base, onPick }: Props) {
  const [open, setOpen] = useState<string | null>(null)
  const now = shown.proficiency
  const before = base.proficiency
  const edit = (label: string, pick: string | null) => (onPick && pick ? <QuickEditButton label={`Edit ${label}`} onClick={() => onPick(pick)} /> : null)
  const list = (items: string[]) => items.join(", ") || NONE
  const change = (pick: string | null) => (onPick && pick ? () => onPick(pick) : null)
  const rows = [
    { icon: Wrench, name: "Tools", value: list(now.tools), before: list(before.tools), text: "You are proficient with these tools.", onChange: change(now.picks.tools) },
    { icon: Languages, name: "Languages", value: list(now.languages), before: list(before.languages), text: "The languages you know.", onChange: change(now.picks.languages) },
    { icon: Shield, name: "Armor", value: now.armor, before: before.armor, text: "The armor you are trained to wear.", onChange: null },
    { icon: Swords, name: "Weapons", value: now.weapons, before: before.weapons, text: "The weapons you are proficient with.", onChange: null },
  ]

  return (
    <div className="flex flex-col">
      <QuickSection label="Saving throws">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-0.5">
          {now.saves.map((save) => (
            <li key={save.label} className="flex items-center gap-2 text-sm">
              <span aria-label={save.proficient ? "Proficient" : "Not proficient"} className={cn("size-2 shrink-0 rounded-full border", save.proficient ? "bg-foreground border-foreground" : "border-muted-foreground/50")} />
              <span className="flex-1 truncate">{save.label}</span>
              <QuickValue value={save.bonus} changed={!has(before.saves, save)} className="text-muted-foreground" />
            </li>
          ))}
        </ul>
      </QuickSection>
      <QuickSection label="Skills" end={edit("skills", now.picks.skills)}>
        {shown.skills.length === 0 && <p className="text-sm">{NONE}</p>}
        <ul className="grid grid-cols-2 gap-x-4 gap-y-0.5">
          {shown.skills.map((skill) => (
            <li key={skill.name} className="flex items-baseline justify-between gap-2 text-sm">
              <span className="truncate">{skill.name}</span>
              <QuickValue value={skill.bonus} changed={!has(base.skills, skill)} className="text-muted-foreground" />
            </li>
          ))}
        </ul>
      </QuickSection>
      <QuickSection label="Training">
        <ul className="-mx-2 flex flex-col">
          {rows.map((row) => (
            <QuickChangeRow key={row.name} {...row} changed={row.value !== row.before} open={open === row.name} onToggle={() => setOpen(open === row.name ? null : row.name)} />
          ))}
        </ul>
      </QuickSection>
    </div>
  )
}
