import type { SheetField } from "@/lib/character-sheet"
import { abilityFacts } from "./ability-facts"
import { AbilityTile } from "./AbilityTile"
import type { SheetActions } from "./character-actions"

type Props = { fields: SheetField[]; columns: number; actions: SheetActions }

// The six abilities as ruled tiles, like the other grids. On a phone, two across.
export function AbilityTiles({ fields, columns, actions }: Props) {
  const facts = abilityFacts(actions)

  return (
    <div
      className="bg-border grid grid-cols-2 gap-px overflow-hidden rounded-lg border shadow-xs sm:grid-cols-[repeat(var(--columns),minmax(0,1fr))]"
      style={{ "--columns": columns } as React.CSSProperties}
    >
      {fields.map((field) => (
        <AbilityTile key={field.id} field={field} actions={actions} facts={facts} />
      ))}
    </div>
  )
}
