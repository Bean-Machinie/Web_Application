import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { parseIncrease, splitIncreaseId, spreadIncreaseId } from "@/lib/character-templates/dnd-5e-2024-tables"
import { ABILITIES } from "@/lib/character-templates/srd-5-2-1"
import type { AbilityId } from "@/lib/character-templates/srd-5-2-1"
import { abilityFacts } from "./ability-facts"
import type { SheetActions } from "./character-actions"
import { setIncrease } from "./quick-ability-changes"

const nameOf = (id: AbilityId) => ABILITIES.find(([ability]) => ability === id)![1]

type SelectProps = { label: string; value: AbilityId; options: AbilityId[]; onChange: (id: AbilityId) => void }

function AbilitySelect({ label, value, options, onChange }: SelectProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground w-6 text-xs tabular-nums">{label}</span>
      <Select value={value} onValueChange={(next) => onChange(next as AbilityId)}>
        <SelectTrigger size="sm" aria-label={`${label} to`} className="flex-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((id) => <SelectItem key={id} value={id}>{nameOf(id)}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}

// The background's increase (p. 21, Adjust Ability Scores): +2 and +1, or +1 to all three. It can
// only go to the three abilities the background lists, so those are the only ones offered.
export function QuickIncreaseControls({ actions }: { actions: SheetActions }) {
  const { background, increaseId } = abilityFacts(actions)
  if (!background) return <p className="text-muted-foreground text-xs">Choose a background to add its increase.</p>

  const listed = background.abilities
  const parsed = parseIncrease(increaseId)
  const two = parsed?.mode === "split" ? parsed.two : listed[0]
  const one = parsed?.mode === "split" ? parsed.one : listed[1]
  const save = (id: string) => setIncrease(actions, id)

  return (
    <section aria-label="Background increase" className="flex flex-col gap-3">
      <h3 className="text-sm font-medium">{background.label} increase</h3>
      <RadioGroup value={parsed?.mode ?? ""} onValueChange={(mode) => save(mode === "spread" ? spreadIncreaseId(listed) : splitIncreaseId(two, one))}>
        <div className="flex items-center gap-2">
          <RadioGroupItem id="quick-increase-split" value="split" />
          <Label htmlFor="quick-increase-split" className="text-xs">+2 / +1</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem id="quick-increase-spread" value="spread" />
          <Label htmlFor="quick-increase-spread" className="text-xs">+1 / +1 / +1</Label>
        </div>
      </RadioGroup>
      {parsed?.mode === "split" && (
        <div className="flex flex-col gap-2">
          <AbilitySelect label="+2" value={two} options={listed} onChange={(id) => save(splitIncreaseId(id, id === one ? listed.find((other) => other !== id)! : one))} />
          <AbilitySelect label="+1" value={one} options={listed.filter((id) => id !== two)} onChange={(id) => save(splitIncreaseId(two, id))} />
        </div>
      )}
      {parsed?.mode === "spread" && <p className="text-muted-foreground text-xs">+1 to {listed.map(nameOf).join(", ")}.</p>}
    </section>
  )
}
