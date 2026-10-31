import { QuickEditButton } from "./QuickEditButton"
import { QuickValue } from "./QuickValue"

type Props = { label: string; value: string; changed: boolean; onEdit?: (() => void) | null }

// A short row of the Proficiencies tab: what it is, what the character has, and a pencil if it can change.
export function QuickProficiencyRow({ label, value, changed, onEdit }: Props) {
  return (
    <div className="flex min-h-6 items-start justify-between gap-2 text-sm">
      <dt className="text-muted-foreground w-20 shrink-0 pt-0.5 text-xs">{label}</dt>
      <dd className="min-w-0 flex-1"><QuickValue value={value} changed={changed} className="-ml-1" /></dd>
      {onEdit && <QuickEditButton label={`Edit ${label.toLowerCase()}`} onClick={onEdit} />}
    </div>
  )
}
