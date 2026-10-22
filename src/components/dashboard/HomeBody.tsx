import { HomeCampaigns } from "./HomeCampaigns"
import { HomeRecent } from "./HomeRecent"

// Home: your campaigns, and what you last changed beside them (under them when narrow).
// Campaigns take the width, at exactly three cards across and centred in it.
export function HomeBody() {
  return (
    <div className="flex flex-col gap-10 xl:flex-row xl:items-start xl:gap-12">
      <div className="min-w-0 flex-1">
        <div className="mx-auto w-[1104px] max-w-full">
          <HomeCampaigns />
        </div>
      </div>
      <HomeRecent />
    </div>
  )
}
