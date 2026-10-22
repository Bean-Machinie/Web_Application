import { useEffect, useState } from "react"
import { errorMessage } from "@/lib/campaigns"
import { fetchAllLinks } from "@/lib/world-graph"
import type { RawLink } from "@/lib/world-graph"

// Every link the person may see; null while loading, and not asked for at all
// unless wanted.
export function useWorldLinks(wanted = true) {
  const [links, setLinks] = useState<RawLink[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!wanted) return
    fetchAllLinks()
      .then(setLinks)
      .catch((failure) => setError(errorMessage(failure)))
  }, [wanted])

  return { links, error }
}
