import { useEffect, useState } from "react"
import { fetchShowcaseCreatures, wolfCreature } from "@/lib/showcase-creatures"
import type { ShowcaseCreature } from "@/lib/showcase-creatures"

// The creatures for the Compendium tile; the Wolf alone when there are none or they cannot be loaded,
// and an empty list until then.
export function useShowcaseCreatures() {
  const [creatures, setCreatures] = useState<ShowcaseCreature[]>([])

  useEffect(() => {
    let current = true
    fetchShowcaseCreatures()
      .catch(() => [])
      .then(async (list) => (list.length > 0 ? list : [await wolfCreature()]))
      .then((list) => current && setCreatures(list))
    return () => {
      current = false
    }
  }, [])

  return creatures
}
