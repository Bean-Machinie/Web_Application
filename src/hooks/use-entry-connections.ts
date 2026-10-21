import { useCallback, useEffect, useState } from "react"
import { groupConnections } from "@/lib/connection-groups"
import type { Connections } from "@/lib/connection-groups"
import { fetchConnections } from "@/lib/world-connections"
import type { WorldEntryKind } from "@/lib/world-kinds"
import type { SaveState } from "./use-world-fields"

// The links to and from an entry, grouped, or null until they arrive. A failure
// is the same as none: this is an extra on the page, not worth an error over
// it. `reload` asks again, for when something may have changed since. Given the
// save state of the entry's fields, it asks again after each save, so a mention
// just written is there without a reload.
export function useEntryConnections(
  entryId: string,
  kind: WorldEntryKind,
  saveState?: SaveState
) {
  const [connections, setConnections] = useState<Connections | null>(null)

  const reload = useCallback(
    () =>
      fetchConnections(entryId)
        .then(({ links, entries }) => setConnections(groupConnections(entryId, kind, links, entries)))
        .catch(() => {}),
    [entryId, kind]
  )

  useEffect(() => {
    reload()
  }, [reload])

  useEffect(() => {
    if (saveState === "saved") reload()
  }, [saveState, reload])

  return { connections, reload }
}
