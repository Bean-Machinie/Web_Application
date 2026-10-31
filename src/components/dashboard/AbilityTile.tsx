import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { isEdited } from "@/lib/character-derive"
import { explain } from "@/lib/character-glossary"
import type { SheetField } from "@/lib/character-sheet"
import type { AbilityId } from "@/lib/character-templates/srd-5-2-1"
import { readStat } from "@/lib/character-values"
import { increaseNote } from "./ability-facts"
import type { AbilityFacts } from "./ability-facts"
import type { SheetActions } from "./character-actions"
import { calculatedText } from "./character-calculated"
import { resetPicks } from "./character-reset"
import { CharacterDerivedValue } from "./CharacterDerivedValue"
import { CharacterFieldBody } from "./CharacterFieldBody"
import { GlossaryLabel } from "./GlossaryLabel"

type Props = { field: SheetField; actions: SheetActions; facts: AbilityFacts }

// One ability, as on D&D Beyond: its name small in capitals, the modifier large in the
// middle, and the score in a small box over the bottom edge. Typing in the box writes over
// the score the sheet works out (the base score is set in the builder), and its
// tooltip says where an increase comes from.
export function AbilityTile({ field, actions, facts }: Props) {
  const total = field.secondary ? actions.byId.get(field.secondary) : undefined
  const modifier = field.tertiary ? actions.byId.get(field.tertiary) : undefined
  const edited = total ? isEdited(total, actions.values) : false
  // Typed over, the tile says so under the score and has no increase to explain.
  const note = edited || !total ? null : increaseNote(facts, field.id as AbilityId, readStat(actions.values[field.id]?.value), actions.derived[total.id] ?? null)

  const box = total && (
    <span className="bg-background inline-block rounded-md border px-0.5 shadow-xs">
      <CharacterDerivedValue
        field={total}
        shown={actions.derived[total.id] ?? null}
        edited={edited}
        calculated={edited ? calculatedText(actions, total) : null}
        box
        onEnter={(value) => actions.onValue(total.id, value)}
        onReset={() => resetPicks(actions, [total.id], `${field.label} total`)}
      />
    </span>
  )

  return (
    <div className="bg-card relative flex flex-col items-center gap-0.5 rounded-lg border px-2 pt-2 pb-3.5 shadow-xs">
      <GlossaryLabel explanation={explain(field, actions)}>
        <span className="text-muted-foreground max-w-full truncate text-[10px] leading-4 font-medium tracking-wide uppercase">{field.label}</span>
      </GlossaryLabel>
      <div className="flex h-8 w-full items-center justify-center">
        {modifier && <CharacterFieldBody field={modifier} actions={actions} tile />}
      </div>
      <div className="absolute bottom-0 left-1/2 translate-y-1/2 -translate-x-1/2">
        {note ? (
          <Tooltip>
            <TooltipTrigger asChild>{box}</TooltipTrigger>
            <TooltipContent>{note}</TooltipContent>
          </Tooltip>
        ) : (
          box
        )}
      </div>
    </div>
  )
}
