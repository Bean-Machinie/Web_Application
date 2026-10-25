import { HoverIcon } from "@/components/icons/HoverIcon"
import { XIcon } from "@/components/icons/XIcon"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatNumber } from "@/lib/character-derive"
import { ABILITY_OPTIONS } from "@/lib/character-templates/dnd-5e-2024-tables"
import type { Attack } from "@/lib/character-values"
import { toWhole } from "@/lib/character-values"
import { EditedMarker } from "./EditedMarker"
import { InlineText } from "./InlineText"

export const ATTACK_COLUMNS = "grid grid-cols-[minmax(0,1fr)_7rem_4.5rem_5.5rem_minmax(0,1fr)_1.75rem] items-center gap-2"

type Props = {
  attack: Attack
  // The modifier of the ability it uses and the proficiency bonus; null while unknown.
  modifier: number | null
  bonus: number | null
  onChange: (attack: Attack) => void
  onRemove: () => void
}

// One attack. Its to-hit is worked out, and typed over when the player knows better.
export function CharacterAttackRow({ attack, modifier, bonus, onChange, onRemove }: Props) {
  const calculated = modifier === null || (attack.proficient && bonus === null) ? null : modifier + (attack.proficient ? bonus! : 0)
  const shown = attack.toHit ?? calculated

  return (
    <div className={`group/item ${ATTACK_COLUMNS}`}>
      <InlineText value={attack.name} placeholder="Name" maxLength={60} allowEmpty onSave={(name) => onChange({ ...attack, name })} />
      <Select value={attack.ability ?? ""} onValueChange={(ability) => onChange({ ...attack, ability })}>
        <SelectTrigger size="sm" aria-label="Ability used" className="w-full">
          <SelectValue placeholder="—" />
        </SelectTrigger>
        <SelectContent>
          {ABILITY_OPTIONS.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Switch size="sm" checked={attack.proficient} onCheckedChange={(proficient) => onChange({ ...attack, proficient })} aria-label="Proficient" />
      <span className="flex items-center gap-1">
        <span className="w-9">
          <InlineText
            value={shown === null ? "" : String(shown)}
            display={formatNumber(shown, "signed")}
            placeholder="—"
            label="To hit"
            inputMode="numeric"
            allowEmpty
            maxLength={4}
            className="tabular-nums"
            onSave={(text) => onChange({ ...attack, toHit: toWhole(text) })}
          />
        </span>
        {attack.toHit !== null && <EditedMarker onReset={() => onChange({ ...attack, toHit: null })} />}
      </span>
      <InlineText value={attack.damage} placeholder="1d8 + 3 slashing" maxLength={60} allowEmpty onSave={(damage) => onChange({ ...attack, damage })} />
      <Button
        variant="ghost"
        size="icon"
        className="size-6 opacity-0 transition-opacity group-focus-within/item:opacity-100 group-hover/item:opacity-100"
        aria-label={`Remove ${attack.name || "attack"}`}
        onClick={onRemove}
      >
        <HoverIcon icon={XIcon} />
      </Button>
    </div>
  )
}
