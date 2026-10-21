import { GROUP_TITLES } from "@/lib/connection-groups"
import type { ConnectionGroupKey, ConnectionRow as Row } from "@/lib/connection-groups"
import { ConnectionRow } from "./ConnectionRow"
import { connectionTarget } from "./connection-target"
import { useWorldScope } from "./useWorldScope"

type Props = {
  group: ConnectionGroupKey
  rows: Row[]
  // The entry whose page this is, for what a click on a pin leaves behind.
  from: { id: string; name: string }
}

// One relationship, as a list.
export function ConnectionGroup({ group, rows, from }: Props) {
  const { basePath } = useWorldScope()

  return (
    <section className="grid gap-2">
      <h4 className="text-muted-foreground text-xs font-medium">{GROUP_TITLES[group]}</h4>
      <ul className="divide-y overflow-hidden rounded-lg border">
        {rows.map((row) => (
          <ConnectionRow
            key={row.entry.id}
            row={row}
            {...connectionTarget(group, row, basePath, from)}
          />
        ))}
      </ul>
    </section>
  )
}
