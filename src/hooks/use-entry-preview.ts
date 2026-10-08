import { useEffect, useState } from "react"
import { fetchWorldFields } from "@/lib/world-fields"
import type { StoredField } from "@/lib/world-fields"

type Fields = Record<string, StoredField>

const FRESH_MS = 30_000
const cache = new Map<string, { at: number; fields: Fields }>()
const pending = new Map<string, Promise<Fields>>()

// The same call the entry page makes, so a player gets exactly the fields,
// and the "Undisclosed" markers, they would see there.
function load(entryId: string) {
  const inFlight = pending.get(entryId)
  if (inFlight) return inFlight
  const request = fetchWorldFields(entryId)
    .then((fields) => {
      cache.set(entryId, { at: Date.now(), fields })
      return fields
    })
    .finally(() => pending.delete(entryId))
  pending.set(entryId, request)
  return request
}

// The fields of an entry for a hover preview; null while loading or when the
// entry is null. Recently loaded entries show at once.
export function useEntryPreview(entryId: string | null) {
  const [loaded, setLoaded] = useState<{ id: string; fields: Fields } | null>(null)

  useEffect(() => {
    if (!entryId) return
    const hit = cache.get(entryId)
    if (hit && Date.now() - hit.at < FRESH_MS) return
    let current = true
    load(entryId)
      .then((fields) => current && setLoaded({ id: entryId, fields }))
      .catch(() => {})
    return () => {
      current = false
    }
  }, [entryId])

  if (!entryId) return null
  const hit = cache.get(entryId)
  if (hit) return hit.fields
  return loaded?.id === entryId ? loaded.fields : null
}
