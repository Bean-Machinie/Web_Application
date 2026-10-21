import { Badge } from "@/components/ui/badge"
import type { PlanRow } from "@/lib/world-copy-plan"
import { KindLabel } from "./KindLabel"

// The entries the pins link, with which ones the target has a copy of already.
export function CopyPlanList({ rows }: { rows: PlanRow[] }) {
  return (
    <ul className="max-h-60 divide-y overflow-y-auto rounded-lg border [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin]">
      {rows.map((row) => (
        <li key={row.sourceId} className="flex items-center justify-between gap-3 px-3 py-2">
          <span className="grid min-w-0 gap-0.5">
            <span className="truncate text-sm">{row.name}</span>
            <KindLabel kind={row.kind} />
          </span>
          <Badge variant={row.existingId ? "outline" : "secondary"}>
            {row.existingId ? "Already here" : "New"}
          </Badge>
        </li>
      ))}
    </ul>
  )
}
