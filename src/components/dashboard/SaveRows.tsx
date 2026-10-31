import { isEdited } from "@/lib/character-derive"
import { explain } from "@/lib/character-glossary"
import type { SheetField } from "@/lib/character-sheet"
import type { SheetActions } from "./character-actions"
import { calculatedText } from "./character-calculated"
import { resetPicks } from "./character-reset"
import { CharacterFieldBody } from "./CharacterFieldBody"
import { EditedMarker } from "./EditedMarker"
import { GlossaryLabel } from "./GlossaryLabel"

type Props = { fields: SheetField[]; columns: number; actions: SheetActions }

// The six saving throws, as on D&D Beyond: a dot that is filled when proficient, the
// ability, and the total. The dot starts out as the class says and is flipped with a click.
export function SaveRows({ fields, columns, actions }: Props) {
  return (
    <dl
      className="bg-border grid grid-cols-1 gap-px overflow-hidden rounded-lg border shadow-xs sm:grid-cols-[repeat(var(--columns),minmax(0,1fr))] [&>div]:bg-card"
      style={{ "--columns": columns } as React.CSSProperties}
    >
      {fields.map((field) => {
        const total = field.secondary ? actions.byId.get(field.secondary) : undefined
        const on = (actions.derived[field.id] ?? 0) > 0
        return (
          <div key={field.id} className="flex min-h-10 items-center gap-3 px-3 py-1.5 sm:px-4">
            <button
              type="button"
              role="switch"
              aria-checked={on}
              aria-label={`${field.label} saving throw proficiency`}
              onClick={() => actions.onValue(field.id, !on)}
              className={`focus-visible:ring-ring size-3.5 shrink-0 rounded-full border outline-none focus-visible:ring-2 ${on ? "bg-primary border-primary" : "bg-transparent"}`}
            />
            <dt className="text-muted-foreground min-w-0 flex-1 truncate text-sm">
              <GlossaryLabel explanation={explain(field, actions)}>
                <span>{field.label}</span>
              </GlossaryLabel>
            </dt>
            {isEdited(field, actions.values) && <EditedMarker calculated={calculatedText(actions, field)} onReset={() => resetPicks(actions, [field.id], `${field.label} proficiency`)} />}
            <dd className="shrink-0">{total && <CharacterFieldBody field={total} actions={actions} />}</dd>
          </div>
        )
      })}
    </dl>
  )
}
