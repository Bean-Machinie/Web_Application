import { QuickEditButton } from "./QuickEditButton"

// A section's small heading, with its pencil at the right when it can be changed.
export function QuickSectionHeader({ title, onEdit }: { title: string; onEdit?: (() => void) | null }) {
  return (
    <div className="flex h-6 items-center justify-between">
      <h3 className="text-muted-foreground text-xs font-medium">{title}</h3>
      {onEdit && <QuickEditButton label={`Edit ${title.toLowerCase()}`} onClick={onEdit} />}
    </div>
  )
}
