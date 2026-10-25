import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { parseIncrease, splitIncreaseId, spreadIncreaseId } from "@/lib/character-templates/dnd-5e-2024-tables"
import { ABILITIES, ABILITY_CAP } from "@/lib/character-templates/srd-5-2-1"
import type { AbilityId } from "@/lib/character-templates/srd-5-2-1"
import { totalWith } from "./ability-facts"
import type { AbilityFacts } from "./ability-facts"
import type { Scores } from "./ability-scores"
import { AbilityRow } from "./AbilityRow"

type Props = { base: Scores; facts: AbilityFacts; increase: string | null; onIncrease: (id: string | null) => void }

const nameOf = (id: AbilityId) => ABILITIES.find(([other]) => other === id)![1]

// "15 → 17 (+3)": the score, what the increase makes it, and the modifier of that.
function preview(score: number | undefined, bonus: number) {
  if (score === undefined) return "—"
  const total = totalWith(score, bonus)
  const modifier = Math.floor((total - 10) / 2)
  const signed = modifier >= 0 ? `+${modifier}` : String(modifier)
  return `${bonus ? `${score} → ` : ""}${total} (${signed})${total < score + bonus ? ` · max ${ABILITY_CAP}` : ""}`
}

// Step 2: the background's increase. Only its three abilities are offered: +2 to one and +1
// to another, or +1 to all three. The preview shows each score as it will be.
export function AbilityIncreaseStep({ base, facts, increase, onIncrease }: Props) {
  const background = facts.background
  if (!background) {
    return (
      <p className="text-muted-foreground text-sm">
        No background is chosen, so there is no increase to make. Choose one on the Overview to see which abilities it
        raises, or skip this step.
      </p>
    )
  }

  const abilities = background.abilities
  const parsed = parseIncrease(increase)
  const bonusOf = (id: AbilityId) => (parsed?.mode === "spread" ? 1 : parsed?.two === id ? 2 : parsed?.one === id ? 1 : 0)

  function chooseMode(mode: string) {
    if (mode === "spread") onIncrease(spreadIncreaseId(abilities))
    else if (mode === "split") onIncrease(splitIncreaseId(abilities[0], abilities[1]))
    else onIncrease(null)
  }

  function picker(label: string, value: AbilityId | undefined, other: AbilityId | undefined, change: (id: AbilityId) => void) {
    return (
      <label className="flex items-center justify-between gap-3 text-sm">
        {label}
        <Select value={value ?? ""} onValueChange={(id) => change(id as AbilityId)}>
          <SelectTrigger size="sm" aria-label={label} className="w-40">
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            {abilities.map((id) => (
              <SelectItem key={id} value={id} disabled={id === other}>
                {nameOf(id)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
    )
  }

  return (
    <div className="grid gap-4">
      <p className="text-muted-foreground text-xs">
        {background.label} raises {abilities.map(nameOf).join(", ")}. No score goes above {ABILITY_CAP}.
      </p>
      <ToggleGroup type="single" variant="outline" size="sm" value={parsed?.mode ?? ""} onValueChange={chooseMode} aria-label="Increase">
        <ToggleGroupItem value="split" className="px-3">+2 and +1</ToggleGroupItem>
        <ToggleGroupItem value="spread" className="px-3">+1 to all three</ToggleGroupItem>
      </ToggleGroup>
      {parsed?.mode === "split" && (
        <div className="grid gap-2">
          {picker("+2 to", parsed.two, parsed.one, (two) => onIncrease(splitIncreaseId(two, parsed.one))) }
          {picker("+1 to", parsed.one, parsed.two, (one) => onIncrease(splitIncreaseId(parsed.two, one)))}
        </div>
      )}
      <div className="grid gap-1 border-t pt-3">
        {abilities.map((id) => (
          <AbilityRow key={id} id={id} label={nameOf(id)} facts={facts}>
            <span className="text-sm tabular-nums">{preview(base[id], bonusOf(id))}</span>
          </AbilityRow>
        ))}
      </div>
    </div>
  )
}
