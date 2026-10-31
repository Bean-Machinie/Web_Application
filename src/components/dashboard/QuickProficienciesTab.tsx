import { Star, ShieldCheck, Wrench } from "lucide-react"
import { Accordion } from "@/components/ui/accordion"
import type { CardModel } from "@/lib/quick-card"
import { NONE } from "@/lib/character-format"
import { has } from "@/lib/quick-card-format"
import { cn } from "@/lib/utils"
import { QuickChangeRow } from "./QuickChangeRow"
import { QuickSection } from "./QuickSection"
import { QuickValue } from "./QuickValue"

type Props = { shown: CardModel; base: CardModel; onPick: ((pick: string) => void) | null; onReset: ((field: string, label: string) => void) | null }

// Saving throws with a dot where proficient, the skills in two columns, then tools, languages,
// armor training and weapons as accordion rows.
export function QuickProficienciesTab({ shown, base, onPick, onReset }: Props) {
  const now = shown.proficiency
  const before = base.proficiency
  const list = (items: string[]) => items.join(", ") || NONE
  const change = (pick: string | null) => (onPick && pick ? () => onPick(pick) : null)
  const reset = (pick: string | null, own: boolean, label: string) => (onReset && pick && own ? () => onReset(pick, label) : null)
  const rows = [
    { name: "Tools", text: list(now.tools), before: list(before.tools), about: "You are proficient with these tools.", onChange: change(now.picks.tools), onReset: reset(now.picks.tools, now.resettable.tools, "tools") },
    { name: "Languages", text: list(now.languages), before: list(before.languages), about: "The languages you know.", onChange: change(now.picks.languages), onReset: reset(now.picks.languages, now.resettable.languages, "languages") },
    { name: "Armor", text: now.armor, before: before.armor, about: "The armor you are trained to wear.", onChange: null, onReset: null },
    { name: "Weapons", text: now.weapons, before: before.weapons, about: "The weapons you are proficient with.", onChange: null, onReset: null },
  ]

  return (
    <Accordion type="single" collapsible>
      <QuickSection icon={ShieldCheck} title="Saving throws" subtitle={`Proficient in ${now.saves.filter((save) => save.proficient).length} of 6`}>
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
      <QuickSection icon={Star} title="Skills" subtitle={`${shown.skills.length} proficient`} onOpen={onPick && now.picks.skills ? () => onPick(now.picks.skills!) : null}>
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
      <QuickSection icon={Wrench} title="Training" subtitle="Tools, languages, armor and weapons">
        <div className="flex flex-col">
          {rows.map((row) => (
            <QuickChangeRow key={row.name} value={row.name} name={row.name} text={row.text} changed={row.text !== row.before} about={row.about} onChange={row.onChange} onReset={row.onReset} />
          ))}
        </div>
      </QuickSection>
    </Accordion>
  )
}
