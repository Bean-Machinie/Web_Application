import { useContext } from "react"
import type { WorldEntry } from "@/lib/world-entries"
import { WorldTableContext } from "./WorldTableContext"

// How many entries this one is joined to; a dash while that loads.
export function WorldConnectionsCell({ entry }: { entry: WorldEntry }) {
  const { connections } = useContext(WorldTableContext)
  const count = connections ? (connections.get(entry.id) ?? 0) : null

  return <span className="text-muted-foreground tabular-nums">{count ?? "–"}</span>
}
