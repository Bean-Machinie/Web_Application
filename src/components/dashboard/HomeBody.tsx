import { useWorldEntries } from "@/hooks/use-world-entries"
import { HomeCampaigns } from "./HomeCampaigns"
import { HomeCreateTiles } from "./HomeCreateTiles"
import { HomeRecent } from "./HomeRecent"
import { useWorldScope } from "./useWorldScope"

// Home, top to bottom: what to make, your campaigns, what you last changed. It must
// sit inside the library's scope, which is what the things to make and the cards read.
export function HomeBody() {
  const scope = useWorldScope()
  const { entries, reload } = useWorldEntries(scope)

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
      <HomeCreateTiles reload={reload} />
      <HomeCampaigns />
      <HomeRecent entries={entries} />
    </div>
  )
}
