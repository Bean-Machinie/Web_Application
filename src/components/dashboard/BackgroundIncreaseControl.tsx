import { useState } from "react"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { parseIncrease, splitIncreaseId, spreadIncreaseId } from "@/lib/character-templates/dnd-5e-2024-tables"
import { ABILITIES, ABILITY_CAP } from "@/lib/character-templates/srd-5-2-1"
import type { AbilityId } from "@/lib/character-templates/srd-5-2-1"
import { readStat } from "@/lib/character-values"
import { abilityFacts, bonusFor, totalWith } from "./ability-facts"
import type { SheetActions } from "./character-actions"

const nameOf = (id: AbilityId) => ABILITIES.find(([other]) => other === id)![1]

type Mode = "split" | "spread"
const MODES = [
  { value: "split" as const, label: "+2 and +1" },
  { value: "spread" as const, label: "+1 to all three" },
]

// The background’s increase: "+2 and +1" with a Select for each, or "+1 to all three". Only the
// background’s three abilities are offered, never the same one twice. The tiles follow at
// once. A score that the increase would take over 20 is noted, and stays at 20.
export function BackgroundIncreaseControl({ actions }: { actions: SheetActions }) {
  const facts = abilityFacts(actions)
  const [draft, setDraft] = useState<{ two?: AbilityId; one?: AbilityId }>({})
  const { background } = facts
  if (!background) return <span className="text-muted-foreground text-sm">Choose a background first</span>

  const abilities = background.abilities
  const write = (id: string | null) => actions.onValue("ability-increase", id)
  const parsed = parseIncrease(facts.increaseId)
  const mode: Mode = parsed?.mode ?? "split"
  const two = parsed?.mode === "split" ? parsed.two : draft.two
  const one = parsed?.mode === "split" ? parsed.one : draft.one

  function chooseMode(next: Mode) {
    setDraft({})
    write(next === "spread" ? spreadIncreaseId(abilities) : null)
  }

  // The choice is stored once both are picked; until then it waits here.
  function pick(key: "two" | "one", id: AbilityId) {
    const next = { two, one, [key]: id }
    if (next.two && next.one) write(splitIncreaseId(next.two, next.one))
    else setDraft(next)
  }

  const picker = (key: "two" | "one", label: string, value: AbilityId | undefined, other: AbilityId | undefined) => (
    <Select value={value ?? ""} onValueChange={(id) => pick(key, id as AbilityId)}>
      <SelectTrigger size="sm" aria-label={label} className="w-40">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {abilities.map((id) => (
          <SelectItem key={id} value={id} disabled={id === other}>
            {nameOf(id)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  const capped = abilities.filter((id) => {
    const base = readStat(actions.values[id]?.value)
    const bonus = bonusFor(facts, id)
    return base !== null && bonus > 0 && totalWith(base, bonus) < base + bonus
  })

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <SegmentedControl value={mode} onValueChange={chooseMode} options={MODES} aria-label="Ability increase" className="w-64" />
      {mode === "split" ? (
        <div className="flex flex-wrap gap-2">
          {picker("two", "+2 to…", two, one)}
          {picker("one", "+1 to…", one, two)}
        </div>
      ) : (
        <p className="text-sm">{abilities.map(nameOf).join(", ")}: +1 each</p>
      )}
      {capped.length > 0 && (
        <p className="text-muted-foreground text-xs">
          {capped.map(nameOf).join(" and ")} stays at {ABILITY_CAP}, the most a score can reach.
        </p>
      )}
    </div>
  )
}
