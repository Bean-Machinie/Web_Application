import type { ReactNode } from "react"
import type { SheetField } from "@/lib/character-sheet"
import { InlineText } from "./InlineText"
import { CharacterFieldMenu } from "./CharacterFieldMenu"

type Props = {
  field: SheetField
  pinned: boolean
  // Just added: the name opens ready to be typed.
  fresh: boolean
  // Another field read beside the value, like a skill's total.
  secondary?: ReactNode
  onLabel: (label: string) => void
  onPin: (pinned: boolean) => void
  onRemove: () => void
  children: ReactNode
}

// One row of the facts card, made like an entry's: the name on the left and the value
// beside it. The name of a field the player added is typed over when clicked; the
// template's own are fixed.
export function CharacterFieldRow({ field, pinned, fresh, secondary, onLabel, onPin, onRemove, children }: Props) {
  return (
    <div className="group/field flex min-h-12 items-center gap-3 px-4 py-2 sm:gap-4 sm:px-5">
      <dt className="text-muted-foreground w-24 shrink-0 text-sm sm:w-32">
        {field.custom ? (
          <InlineText value={field.label} placeholder="Name" maxLength={60} autoEdit={fresh} onSave={onLabel} />
        ) : (
          <>
            {field.label}
            {field.hint && <span className="ml-1.5 text-xs opacity-70">{field.hint}</span>}
          </>
        )}
      </dt>
      <dd className="min-w-0 flex-1">{children}</dd>
      {secondary && <div className="w-12 shrink-0 text-right text-sm font-medium">{secondary}</div>}
      <CharacterFieldMenu field={field} pinned={pinned} onPin={onPin} onRemove={onRemove} />
    </div>
  )
}
