import type { Member } from "@/lib/campaign-members"
import type { Campaign } from "@/lib/campaigns"
import { CampaignCard } from "./CampaignCard"

type Props = {
  campaigns: Campaign[]
  members: Record<string, Member[]>
  onLeave: (campaign: Campaign) => void
}

// Cards have a width of their own and wrap, left-aligned: they never stretch to fill
// the row, however wide the page is.
export function CampaignGrid({ campaigns, members, onLeave }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      {campaigns.map((campaign) => (
        <div key={campaign.id} className="w-[360px] max-w-full">
          <CampaignCard campaign={campaign} members={members[campaign.id]} onLeave={onLeave} />
        </div>
      ))}
    </div>
  )
}
