import { useState } from "react"
import { useWorldEntries } from "@/hooks/use-world-entries"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { HomeCampaigns } from "./HomeCampaigns"
import { NewEntryDialog } from "./NewEntryDialog"
import { NewLibraryMapDialog } from "./NewLibraryMapDialog"
import { useWorldScope } from "./useWorldScope"

// Home: your campaigns, and the dialogs of what New makes in your library. It must sit
// inside the library's scope, which the new-entry dialog reads.
export function HomeBody() {
  const scope = useWorldScope()
  const { reload } = useWorldEntries(scope)
  const [makingMap, setMakingMap] = useState(false)
  const [creating, setCreating] = useState<WorldEntryKind | null>(null)

  return (
    <>
      <HomeCampaigns onMap={() => setMakingMap(true)} onEntry={setCreating} />
      <NewLibraryMapDialog open={makingMap} onClose={() => setMakingMap(false)} />
      <NewEntryDialog kind={creating} reload={reload} onClose={() => setCreating(null)} />
    </>
  )
}
