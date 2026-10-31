import { Label } from "@/components/ui/label"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { abilityName } from "@/lib/character-format"
import { parseIncrease, splitIncreaseId, spreadIncreaseId } from "@/lib/character-templates/dnd-5e-2024-tables"
import type { AbilityId } from "@/lib/character-templates/srd-5-2-1"
import { abilityFacts } from "./ability-facts"
import type { SheetActions } from "./character-actions"
import { setIncrease } from "./quick-ability-changes"

type FieldProps = { label: string; value: AbilityId; options: AbilityId[]; onChange: (id: AbilityId) => void }

// A labelled list of abilities, as the map builder's settings are: the label above, muted.
function AbilityField({ label, value, options, onChange }: FieldProps) {
  return (
    <div className="grid gap-2">
      <Label className="text-muted-foreground text-xs font-normal">{label}</Label>
      <Select value={value} onValueChange={(next) => onChange(next as AbilityId)}>
        <SelectTrigger aria-label={label} className="w-full data-[size=default]:h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((id) => <SelectItem key={id} value={id}>{abilityName(id)}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}

// The background's increase (p. 21, Adjust Ability Scores): +2 and +1, or +1 to all three. It can
// only go to the three abilities the background lists, so those are the only ones offered.
export function QuickIncreaseControls({ actions }: { actions: SheetActions }) {
  const { background, increaseId } = abilityFacts(actions)
  if (!background) return <p className="text-muted-foreground p-3 text-xs">Choose a background to add its increase.</p>

  const listed = background.abilities
  const parsed = parseIncrease(increaseId)
  const two = parsed?.mode === "split" ? parsed.two : listed[0]
  const one = parsed?.mode === "split" ? parsed.one : listed[1]
  const save = (id: string) => setIncrease(actions, id)

  return (
    <div className="grid gap-4 p-3">
      <SegmentedControl
        aria-label="Increase"
        value={parsed?.mode ?? "split"}
        onValueChange={(mode) => save(mode === "spread" ? spreadIncreaseId(listed) : splitIncreaseId(two, one))}
        options={[
          { value: "split", label: "+2 / +1" },
          { value: "spread", label: "+1 / +1 / +1" },
        ]}
      />
      {parsed?.mode === "spread" ? (
        <p className="text-muted-foreground text-xs">+1 to {listed.map(abilityName).join(", ")}.</p>
      ) : (
        <>
          <AbilityField label="+2 to" value={two} options={listed} onChange={(id) => save(splitIncreaseId(id, id === one ? listed.find((other) => other !== id)! : one))} />
          <AbilityField label="+1 to" value={one} options={listed.filter((id) => id !== two)} onChange={(id) => save(splitIncreaseId(two, id))} />
        </>
      )}
    </div>
  )
}
