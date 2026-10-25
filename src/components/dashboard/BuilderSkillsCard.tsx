import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cardStatus } from "@/lib/character-cards"
import type { Card } from "@/lib/character-cards"
import { fromOthers, skillGrants } from "@/lib/character-grants"
import { SKILLS } from "@/lib/character-templates/srd-5-2-1"
import { BuilderChoiceCard } from "./BuilderChoiceCard"
import type { SheetActions } from "./character-actions"

type Props = { card: Card; actions: SheetActions }

// Skills to choose: a list of checkboxes with the bonus each would give, or, for one skill
// from any, a Select. A skill that is already held from another source is ticked, locked and
// marked "From <source>", so no pick is wasted.
export function BuilderSkillsCard({ card, actions }: Props) {
  const decl = card.decl
  if (decl.kind !== "skills") return null
  const others = fromOthers(skillGrants(actions), decl.field)
  const sourceOf = (skill: string) => others.find((grant) => grant.id === skill)?.source
  const options = SKILLS.filter(([id]) => decl.from === "any" || decl.from.includes(id))
  const save = (next: string[]) => actions.onValue(decl.field, next)
  const full = card.chosen.length >= decl.count
  const bonus = actions.derived["proficiency-bonus"] ?? 0

  if (decl.count === 1 && decl.from === "any") {
    return (
      <BuilderChoiceCard title={decl.title} source={card.source} status={cardStatus(card)} help="One skill of your choice.">
        <Select value={card.chosen[0] ?? ""} onValueChange={(next) => save([next])}>
          <SelectTrigger size="sm" aria-label={decl.title} className="w-60 max-w-full">
            <SelectValue placeholder="Choose a skill…" />
          </SelectTrigger>
          <SelectContent>
            {options.map(([id, label]) => (
              <SelectItem key={id} value={id} disabled={!!sourceOf(id)}>
                {label}
                {sourceOf(id) && <span className="text-muted-foreground text-xs"> From {sourceOf(id)}</span>}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </BuilderChoiceCard>
    )
  }

  return (
    <BuilderChoiceCard title={decl.title} source={card.source} status={cardStatus(card)} help={`Pick ${decl.count}${decl.from === "any" ? "" : ` from the ${card.source} list`}. You add your Proficiency Bonus (+${bonus}) to checks with these skills.`}>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {options.map(([id, label, ability]) => {
          const held = sourceOf(id)
          const on = card.chosen.includes(id)
          const modifier = actions.derived[`${ability}.mod`] ?? 0
          const total = modifier + (on || held ? bonus : 0)
          return (
            <label key={id} className={`flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm ${held ? "opacity-60" : "hover:bg-accent/50"}`}>
              <Checkbox
                checked={on || !!held}
                disabled={!!held || (!on && full)}
                onCheckedChange={(next) => save(next === true ? [...card.chosen, id] : card.chosen.filter((other) => other !== id))}
              />
              <span className="flex-1">
                {label} <span className="text-muted-foreground text-xs">{ability.toUpperCase()}</span>
              </span>
              <span className="text-muted-foreground text-xs">{held ? `From ${held}` : total >= 0 ? `+${total}` : total}</span>
            </label>
          )
        })}
      </div>
    </BuilderChoiceCard>
  )
}
