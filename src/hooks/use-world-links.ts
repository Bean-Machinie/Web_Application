import { useEffect, useState } from "react"
import { errorMessage } from "@/lib/campaigns"
import { fetchAllLinks } from "@/lib/world-graph"
import type { RawLink } from "@/lib/world-graph"

// Every link the person may see; null while loading.
export function useWorldLinks() {
  const [links, setLinks] = useState<RawLink[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAllLinks()
      .then(setLinks)
      .catch((failure) => setError(errorMessage(failure)))
  }, [])

  return { links, error }
}
