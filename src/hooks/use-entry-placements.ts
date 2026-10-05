import { useEffect, useState } from "react"
import { fetchPlacements } from "@/lib/world-map-markers"
import type { Placement } from "@/lib/world-map-markers"

// The maps an entry is placed on, or null while they load. A failure is the
// same as none: this is an extra on the page, not worth an error over it.
export function useEntryPlacements(entryId: string) {
  const [placements, setPlacements] = useState<Placement[] | null>(null)

  useEffect(() => {
    let current = true
    fetchPlacements(entryId)
      .then((rows) => current && setPlacements(rows))
      .catch(() => current && setPlacements([]))
    return () => {
      current = false
    }
  }, [entryId])

  return placements
}
