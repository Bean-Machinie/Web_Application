import type { Member } from "@/lib/campaign-members"
import type { Campaign } from "@/lib/campaigns"
import { CampaignCard } from "./CampaignCard"

type Props = {
  campaigns: Campaign[]
  members: Record<string, Member[]>
  onLeave: (campaign: Campaign) => void
}

export function CampaignGrid({ campaigns, members, onLeave }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((campaign) => (
        <CampaignCard
          key={campaign.id}
          campaign={campaign}
          members={members[campaign.id]}
          onLeave={onLeave}
        />
      ))}
    </div>
  )
}
