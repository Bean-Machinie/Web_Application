import { useMemo } from "react"
import type { WorldEntry } from "@/lib/world-entries"
import { buildGraph } from "@/lib/world-graph"
import { useWorldLinks } from "./use-world-links"

// How many entries each entry is joined to, by a mention or a pin, counted the way
// the graph draws them. Null while the links load, and not loaded unless wanted.
export function useConnectionCounts(entries: WorldEntry[] | null, wanted: boolean) {
  const { links } = useWorldLinks(wanted)

  return useMemo(() => {
    if (!entries || !links) return null
    const { near } = buildGraph(entries, links, false)
    return new Map([...near].map(([id, others]) => [id, others.size]))
  }, [entries, links])
}
