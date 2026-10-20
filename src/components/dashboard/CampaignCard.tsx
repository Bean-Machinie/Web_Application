import { Link } from "react-router-dom"
import { roleLabel } from "@/lib/campaign-list"
import type { Member } from "@/lib/campaign-members"
import { campaignPath } from "@/lib/campaign-paths"
import type { Campaign } from "@/lib/campaigns"
import { CampaignImage } from "./CampaignImage"
import { CampaignMemberStack } from "./CampaignMemberStack"
import { CampaignMenu } from "./CampaignMenu"

type Props = {
  campaign: Campaign
  members: Member[] | undefined
  onLeave: (campaign: Campaign) => void
}

export function CampaignCard({ campaign, members, onLeave }: Props) {
  return (
    <div className="bg-card hover:border-foreground/25 relative flex h-full flex-col justify-between gap-6 rounded-lg border p-4 transition-colors">
      <div className="flex items-start gap-3">
        <CampaignImage name={campaign.name} imageUrl={campaign.imageUrl} />
        <div className="flex min-w-0 flex-1 flex-col">
          {/* The stretched link makes the whole card clickable. */}
          <Link
            to={campaignPath(campaign.id)}
            className="truncate font-medium outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-ring focus-visible:after:rounded-lg focus-visible:after:ring-2"
          >
            {campaign.name}
          </Link>
          <span className="text-muted-foreground text-sm">{roleLabel(campaign.role)}</span>
        </div>
        <div className="relative z-10 -mt-1 -mr-2">
          <CampaignMenu campaign={campaign} onLeave={onLeave} />
        </div>
      </div>
      <CampaignMemberStack members={members} />
    </div>
  )
}
