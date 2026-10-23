import { isPinned } from "@/lib/character-sheet"
import type { SheetField } from "@/lib/character-sheet"
import type { SheetActions } from "./character-actions"
import { CharacterFieldBody } from "./CharacterFieldBody"
import { CharacterFieldRow } from "./CharacterFieldRow"

// Fields as the rows of one card, the label on the left. A field with a secondary (a
// skill and its total) shows that beside its value.
export function CharacterRows({ fields, actions }: { fields: SheetField[]; actions: SheetActions }) {
  return (
    <dl className="bg-card flex min-w-0 flex-col divide-y rounded-lg border shadow-xs">
      {fields.map((field) => {
        const second = field.secondary ? actions.byId.get(field.secondary) : undefined
        return (
          <CharacterFieldRow
            key={field.id}
            field={field}
            pinned={isPinned(field, actions.values)}
            fresh={field.id === actions.freshId}
            secondary={second && <CharacterFieldBody field={second} actions={actions} />}
            onLabel={(label) => actions.onField(field, label, field.config)}
            onPin={(pinned) => actions.onPin(field.id, pinned)}
            onRemove={() => actions.onRemove(field.id)}
          >
            <CharacterFieldBody field={field} actions={actions} />
          </CharacterFieldRow>
        )
      })}
    </dl>
  )
}
