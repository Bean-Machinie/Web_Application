import { GROUP_TITLES } from "@/lib/connection-groups"
import type { ConnectionGroupKey, ConnectionRow } from "@/lib/connection-groups"
import { ConnectionRailRow } from "./ConnectionRailRow"
import { connectionTarget } from "./connection-target"
import { useWorldScope } from "./useWorldScope"

type Props = {
  group: ConnectionGroupKey
  rows: ConnectionRow[]
  from: { id: string; name: string }
}

// One relationship in the rail: a small muted heading over one line per entry.
export function ConnectionRailGroup({ group, rows, from }: Props) {
  const { basePath } = useWorldScope()

  return (
    <section className="grid min-w-0 gap-1">
      <h4 className="text-muted-foreground px-2 text-xs font-medium">{GROUP_TITLES[group]}</h4>
      <ul className="grid min-w-0 gap-0.5">
        {rows.map((row) => (
          <ConnectionRailRow
            key={row.entry.id}
            row={row}
            {...connectionTarget(group, row, basePath, from)}
          />
        ))}
      </ul>
    </section>
  )
}
