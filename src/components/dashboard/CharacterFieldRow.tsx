import type { ReactNode } from "react"
import type { SheetField } from "@/lib/character-sheet"
import { InlineText } from "./InlineText"
import { CharacterFieldMenu } from "./CharacterFieldMenu"

type Props = {
  field: SheetField
  pinned: boolean
  // Just added: the name opens ready to be typed.
  fresh: boolean
  // "compact": rows in several columns, the label takes what is left and the value is as
  // small as it can be. "narrow": a short label column, for the profile card.
  size: "wide" | "compact" | "narrow"
  // Another field read beside the value, like a skill's total.
  secondary?: ReactNode
  onLabel: (label: string) => void
  onPin: (pinned: boolean) => void
  onLength: (length: number) => void
  onRemove: () => void
  children: ReactNode
}

// One row of a card, about 40px: the name on the left, which never wraps (a long one is
// cut short and shows whole as a tooltip), and the value beside it. The name of a field
// the player added is typed over when clicked; the template's own are fixed.
const LABEL = {
  wide: "w-36 shrink-0",
  compact: "min-w-0 flex-1",
  narrow: "w-28 shrink-0",
}

export function CharacterFieldRow({ field, pinned, fresh, size, secondary, onLabel, onPin, onLength, onRemove, children }: Props) {
  const compact = size === "compact"

  return (
    <div className="group/field flex min-h-10 items-center gap-3 px-3 py-1.5 sm:px-4">
      <dt className={`text-muted-foreground text-sm ${LABEL[size]}`}>
        {field.custom ? (
          <InlineText value={field.label} placeholder="Name" maxLength={60} autoEdit={fresh} onSave={onLabel} />
        ) : (
          <span className="block truncate" title={field.hint ? `${field.title ?? field.label} (${field.hint})` : (field.title ?? field.label)}>
            {field.label}
            {field.hint && <span className="ml-1.5 text-xs opacity-70">{field.hint}</span>}
          </span>
        )}
      </dt>
      <dd className={compact ? "shrink-0" : "min-w-0 flex-1"}>{children}</dd>
      {secondary && <div className="shrink-0 text-right text-sm font-medium">{secondary}</div>}
      <CharacterFieldMenu field={field} pinned={pinned} onPin={onPin} onLength={onLength} onRemove={onRemove} />
    </div>
  )
}
