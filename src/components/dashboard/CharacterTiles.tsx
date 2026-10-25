import { isPinned } from "@/lib/character-sheet"
import type { SheetField } from "@/lib/character-sheet"
import type { SheetActions } from "./character-actions"
import { CharacterFieldBody } from "./CharacterFieldBody"
import { CharacterFieldMenu } from "./CharacterFieldMenu"

type Props = { fields: SheetField[]; columns: number; actions: SheetActions }

// Fields as tiles in a grid, about 88px tall, drawn like the stat block of an entry: ruled
// cells, the label small over the value. A field with a secondary shows it under the
// value (a score and its modifier). On a phone the tiles are two across.
export function CharacterTiles({ fields, columns, actions }: Props) {
  return (
    <div
      className="bg-border grid grid-cols-2 gap-px overflow-hidden rounded-lg border shadow-xs sm:grid-cols-[repeat(var(--columns),minmax(0,1fr))]"
      style={{ "--columns": columns } as React.CSSProperties}
    >
      {fields.map((field) => {
        const nested = [field.secondary, field.tertiary].map((id) => (id ? actions.byId.get(id) : undefined)).filter((other) => other !== undefined)
        return (
          <div key={field.id} className="group/field bg-card relative flex min-h-22 flex-col items-center gap-1 px-2 py-3">
            <span className="text-muted-foreground max-w-full truncate text-xs font-medium" title={field.title ?? field.label}>
              {field.label}
            </span>
            {/* One height for every kind of value, so they all sit on the same line. */}
            <div className="flex h-8 w-full items-center justify-center">
              <CharacterFieldBody field={field} actions={actions} tile />
            </div>
            {nested.length > 0 && (
              <span className="text-muted-foreground flex items-center gap-1 text-sm tabular-nums [&_button]:text-center">
                {nested.map((other) => (
                  <span key={other.id} title={other.title ?? other.label}>
                    <CharacterFieldBody field={other} actions={actions} />
                  </span>
                ))}
              </span>
            )}
            <CharacterFieldMenu
              field={field}
              pinned={isPinned(field, actions.values)}
              onPin={(pinned) => actions.onPin(field.id, pinned)}
              onLength={(length) => actions.onField(field, field.label, { ...field.config, length })}
              onRemove={() => actions.onRemove(field.id)}
              className="absolute top-1 right-1"
            />
          </div>
        )
      })}
    </div>
  )
}
