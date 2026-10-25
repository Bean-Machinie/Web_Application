import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SheetField } from "@/lib/character-sheet"
import { readAttacks } from "@/lib/character-values"
import type { Attack } from "@/lib/character-values"
import type { SheetActions } from "./character-actions"
import { CharacterAttackRow, ATTACK_COLUMNS } from "./CharacterAttackRow"

const HEADINGS = ["Name", "Ability", "To hit", "Damage"]

// The attacks as a table of rows: name, the ability it uses, to-hit and damage. The to-hit
// is that ability's modifier plus the proficiency bonus unless the player wrote their own.
export function CharacterAttacksValue({ field, actions }: { field: SheetField; actions: SheetActions }) {
  const attacks = readAttacks(actions.values[field.id]?.value)
  const save = (next: Attack[]) => actions.onValue(field.id, next)
  const bonus = actions.derived["proficiency-bonus"] ?? null

  return (
    <div className="flex min-w-0 flex-col gap-1">
      {attacks.length > 0 && (
        <div className={`${ATTACK_COLUMNS} text-muted-foreground px-0 text-xs`}>
          {HEADINGS.map((heading) => (
            <span key={heading}>{heading}</span>
          ))}
          <span />
        </div>
      )}
      {attacks.map((attack) => (
        <CharacterAttackRow
          key={attack.id}
          attack={attack}
          modifier={attack.ability ? (actions.derived[`${attack.ability}.mod`] ?? null) : null}
          bonus={bonus}
          onChange={(changed) => save(attacks.map((other) => (other.id === attack.id ? changed : other)))}
          onRemove={() => save(attacks.filter((other) => other.id !== attack.id))}
        />
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground -ml-2 w-fit"
        onClick={() => save([...attacks, { id: crypto.randomUUID(), name: "", ability: "str", toHit: null, damage: "" }])}
      >
        <Plus />
        Add attack
      </Button>
    </div>
  )
}
