import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { choiceState } from "@/lib/character-choices"
import type { SheetField } from "@/lib/character-sheet"
import type { SheetActions } from "./character-actions"

// A choice the sheet fixes from another (the origin feat a background gives): plain text
// with where it comes from, and a tooltip naming it as the SRD does.
export function CharacterLockedChoice({ field, actions }: { field: SheetField; actions: SheetActions }) {
  const { selected } = choiceState(field, actions.byId, actions.derived)
  const sourceField = field.source ? actions.byId.get(field.source) : undefined
  const from = sourceField ? choiceState(sourceField, actions.byId, actions.derived).selected : null
  if (!selected) return <span className="text-muted-foreground text-sm">—</span>

  const tip = `The ${field.title ?? field.label.toLowerCase()} your ${sourceField?.label.toLowerCase() ?? "choice"} gives. Called “${selected.label}” in the SRD 5.2.1.`

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-default text-sm">
          {selected.label}
          {from && <span className="text-muted-foreground"> · from {from.label}</span>}
        </span>
      </TooltipTrigger>
      <TooltipContent>{tip}</TooltipContent>
    </Tooltip>
  )
}
