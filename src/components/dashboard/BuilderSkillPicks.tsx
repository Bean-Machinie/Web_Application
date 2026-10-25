import { Checkbox } from "@/components/ui/checkbox"
import { SKILLS } from "@/lib/character-templates/srd-5-2-1"
import type { SrdBackground, SrdClass } from "@/lib/character-templates/srd-5-2-1"
import { readPicks } from "@/lib/character-values"
import type { SheetActions } from "./character-actions"

type Props = { cls: SrdClass; background: SrdBackground | null; actions: SheetActions }

// The skills a class lets you choose, as checkboxes: "Choose 2", and no more than that can
// be ticked. A class without a list (the Bard) offers every skill.
export function BuilderSkillPicks({ cls, background, actions }: Props) {
  const picks = readPicks(actions.values["class-skills"]?.value)
  const options = SKILLS.filter(([id]) => !cls.skills || cls.skills.includes(id))
  const full = picks.length >= cls.skillCount

  function toggle(id: string, on: boolean) {
    actions.onValue("class-skills", on ? [...picks, id] : picks.filter((other) => other !== id))
  }

  return (
    <div className="grid gap-2">
      <p className="flex items-baseline justify-between text-sm">
        <span className="font-medium">Choose {cls.skillCount}</span>
        <span className="text-muted-foreground text-xs tabular-nums">
          {picks.length} of {cls.skillCount}
        </span>
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {options.map(([id, label]) => {
          const on = picks.includes(id)
          return (
            <label key={id} className="flex min-h-8 items-center gap-2 text-sm">
              <Checkbox checked={on} disabled={!on && full} onCheckedChange={(next) => toggle(id, next === true)} />
              <span>{label}</span>
              {background?.skills.includes(id) && <span className="text-muted-foreground text-xs">also from {background.label}</span>}
            </label>
          )
        })}
      </div>
    </div>
  )
}
