import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { choiceState } from "@/lib/character-choices"
import type { SheetActions } from "./character-actions"

type Props = {
  fieldId: string
  actions: SheetActions
  placeholder: string
  // Offer only these options.
  only?: string[]
  onPick?: (id: string) => void
}

// A Select for one of the sheet’s choice fields; picking writes it like any other edit.
export function BuilderChoiceSelect({ fieldId, actions, placeholder, only, onPick }: Props) {
  const field = actions.byId.get(fieldId)
  if (!field) return null
  const { options, selected } = choiceState(field, actions.byId, actions.derived)

  return (
    <Select value={selected?.id ?? ""} onValueChange={(id) => (onPick ?? ((next) => actions.onValue(fieldId, next)))(id)}>
      <SelectTrigger size="sm" aria-label={field.label} className="w-56 max-w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options
          .filter((option) => !only || only.includes(option.id))
          .map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  )
}
