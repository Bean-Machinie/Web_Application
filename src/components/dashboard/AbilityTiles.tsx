import type { SheetField } from "@/lib/character-sheet"
import { abilityFacts } from "./ability-facts"
import { AbilityTile } from "./AbilityTile"
import type { SheetActions } from "./character-actions"

type Props = { fields: SheetField[]; columns: number; actions: SheetActions }

// The six abilities as separate tiles, with room under them for the scores that hang over
// their edges. On a phone, three across.
export function AbilityTiles({ fields, columns, actions }: Props) {
  const facts = abilityFacts(actions)

  return (
    <div
      className="grid grid-cols-3 gap-x-3 gap-y-5 pb-2 sm:grid-cols-[repeat(var(--columns),minmax(0,1fr))]"
      style={{ "--columns": columns } as React.CSSProperties}
    >
      {fields.map((field) => (
        <AbilityTile key={field.id} field={field} actions={actions} facts={facts} />
      ))}
    </div>
  )
}
