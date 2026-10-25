import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { SheetField } from "@/lib/character-sheet"
import type { AbilityId } from "@/lib/character-templates/srd-5-2-1"
import { readStat } from "@/lib/character-values"
import { increaseNote } from "./ability-facts"
import type { AbilityFacts } from "./ability-facts"
import { AbilityBadges } from "./AbilityBadges"
import type { SheetActions } from "./character-actions"
import { CharacterFieldBody } from "./CharacterFieldBody"

type Props = { field: SheetField; actions: SheetActions; facts: AbilityFacts }

// One ability: the modifier big, the total score small in a pill under it. The pill's
// tooltip says where an increase comes from. The base score is set in the Set scores dialog.
export function AbilityTile({ field, actions, facts }: Props) {
  const total = field.secondary ? actions.derived[field.secondary] : null
  const modifier = field.tertiary ? actions.byId.get(field.tertiary) : undefined
  const note = increaseNote(facts, field.id as AbilityId, readStat(actions.values[field.id]?.value))
  const pill = (
    <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-xs tabular-nums">{total ?? "—"}</span>
  )

  return (
    <div className="bg-card flex min-h-28 flex-col items-center gap-1 px-2 py-3">
      <span className="text-muted-foreground max-w-full truncate text-xs font-medium">{field.label}</span>
      <div className="flex h-4 items-center">
        <AbilityBadges ability={field.id as AbilityId} facts={facts} />
      </div>
      <div className="flex h-8 w-full items-center justify-center">
        {modifier && <CharacterFieldBody field={modifier} actions={actions} tile />}
      </div>
      {note ? (
        <Tooltip>
          <TooltipTrigger asChild>{pill}</TooltipTrigger>
          <TooltipContent>{note}</TooltipContent>
        </Tooltip>
      ) : (
        pill
      )}
    </div>
  )
}
