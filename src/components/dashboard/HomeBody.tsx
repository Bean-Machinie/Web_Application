import { useState } from "react"
import { useWorldEntries } from "@/hooks/use-world-entries"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { HomeCampaigns } from "./HomeCampaigns"
import { HomeRecent } from "./HomeRecent"
import { NewEntryDialog } from "./NewEntryDialog"
import { NewLibraryMapDialog } from "./NewLibraryMapDialog"
import { useWorldScope } from "./useWorldScope"

// Home: your campaigns, what you last changed, and the dialogs of what New makes in
// your library. It must sit inside the library's scope, which the new-entry dialog reads.
export function HomeBody() {
  const scope = useWorldScope()
  const { reload } = useWorldEntries(scope)
  const [makingMap, setMakingMap] = useState(false)
  const [creating, setCreating] = useState<WorldEntryKind | null>(null)

  return (
    <>
      {/* Campaigns take the width, at exactly three cards across and centred in it; recent
          activity sits beside them, or under them when narrow. */}
      <div className="flex flex-col gap-10 xl:flex-row xl:items-start xl:gap-12">
        <div className="min-w-0 flex-1">
          <div className="mx-auto w-[1104px] max-w-full">
            <HomeCampaigns onMap={() => setMakingMap(true)} onEntry={setCreating} />
          </div>
        </div>
        <HomeRecent />
      </div>
      <NewLibraryMapDialog open={makingMap} onClose={() => setMakingMap(false)} />
      <NewEntryDialog kind={creating} reload={reload} onClose={() => setCreating(null)} />
    </>
  )
}
