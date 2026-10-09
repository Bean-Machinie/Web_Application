import { readStatBlock } from "@/lib/stat-block"
import type { FieldViewProps } from "./field-types"

export function StatActionsView({ value }: FieldViewProps) {
  const actions = readStatBlock(value).actions ?? []
  if (actions.length === 0) return <p className="text-muted-foreground text-sm">No actions.</p>

  return (
    <dl className="bg-card divide-y rounded-lg border shadow-xs">
      {actions.map((action) => (
        <div key={action.id} className="flex flex-col gap-0.5 px-4 py-2.5 sm:flex-row sm:gap-4">
          <dt className="w-44 shrink-0 text-sm font-medium">{action.name}</dt>
          <dd className="text-muted-foreground text-sm">{action.text}</dd>
        </div>
      ))}
    </dl>
  )
}
