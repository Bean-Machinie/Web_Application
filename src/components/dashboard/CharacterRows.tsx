import { isPinned } from "@/lib/character-sheet"
import type { SheetField } from "@/lib/character-sheet"
import type { SheetActions } from "./character-actions"
import { CharacterFieldBody } from "./CharacterFieldBody"
import { CharacterFieldRow } from "./CharacterFieldRow"

type Props = { fields: SheetField[]; actions: SheetActions; columns?: number; narrow?: boolean }

// A pair's second track with its caption ("Failures"), which stays right after the first.
function Pair({ field, actions }: { field: SheetField; actions: SheetActions }) {
  return (
    <span className="ml-4 flex items-center gap-2">
      <span className="text-muted-foreground text-xs">{field.caption}</span>
      <CharacterFieldBody field={field} actions={actions} />
    </span>
  )
}

// Fields as the rows of one card, the label on the left. With several columns the rows
// are ruled cells of a grid, as compact as they go. A field with a secondary shows it beside
// its value (a skill's total at the right; a death save's other track right after the first).
export function CharacterRows({ fields, actions, columns = 1, narrow }: Props) {
  const rows = fields.map((field) => {
    const second = field.secondary ? actions.byId.get(field.secondary) : undefined
    const paired = second?.type === "track"
    return (
      <CharacterFieldRow
        key={field.id}
        field={field}
        pinned={isPinned(field, actions.values)}
        fresh={field.id === actions.freshId}
        highlighted={field.highlight !== undefined && (actions.derived[field.highlight] ?? 0) > 0}
        size={columns > 1 ? "compact" : narrow ? "narrow" : "wide"}
        secondary={
          second &&
          !paired && (
            <span className="inline-block min-w-8 text-right">
              <CharacterFieldBody field={second} actions={actions} />
            </span>
          )
        }
        onLabel={(label) => actions.onField(field, label, field.config)}
        onPin={(pinned) => actions.onPin(field.id, pinned)}
        onLength={(length) => actions.onField(field, field.label, { ...field.config, length })}
        onRemove={() => actions.onRemove(field.id)}
      >
        <span className="flex items-center gap-2">
          {field.caption && <span className="text-muted-foreground text-xs">{field.caption}</span>}
          <CharacterFieldBody field={field} actions={actions} />
          {second && paired && <Pair field={second} actions={actions} />}
        </span>
      </CharacterFieldRow>
    )
  })

  if (columns > 1) {
    return (
      <dl
        className="bg-border grid grid-cols-1 gap-px overflow-hidden rounded-lg border shadow-xs sm:grid-cols-[repeat(var(--columns),minmax(0,1fr))] [&>div]:bg-card"
        style={{ "--columns": columns } as React.CSSProperties}
      >
        {rows}
      </dl>
    )
  }

  return <dl className="bg-card flex min-w-0 flex-col divide-y rounded-lg border shadow-xs">{rows}</dl>
}
