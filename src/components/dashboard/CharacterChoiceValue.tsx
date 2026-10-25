import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { choiceState } from "@/lib/character-choices"
import { isEdited } from "@/lib/character-derive"
import type { SheetField } from "@/lib/character-sheet"
import type { SheetActions } from "./character-actions"
import { EditedMarker } from "./EditedMarker"

const CLEAR = "__clear"

type Props = { field: SheetField; actions: SheetActions }

// One option from the template's list. When the sheet works the pick out (a size from the
// species), the player's own choice stands in for it, until reset.
export function CharacterChoiceValue({ field, actions }: Props) {
  const { options, selected } = choiceState(field, actions.byId, actions.derived)
  const clearable = !field.derived && selected !== null

  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <Select
        value={selected?.id ?? ""}
        onValueChange={(id) => actions.onValue(field.id, id === CLEAR ? null : id)}
        disabled={options.length === 0}
      >
        <SelectTrigger size="sm" aria-label={field.label} className="min-w-0 flex-1">
          <SelectValue placeholder="—" />
        </SelectTrigger>
        <SelectContent>
          {clearable && <SelectItem value={CLEAR}>—</SelectItem>}
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isEdited(field, actions.values) && <EditedMarker onReset={() => actions.onValue(field.id, null)} />}
    </span>
  )
}
