import { Link } from "react-router-dom"
import { TiltCard } from "@/components/TiltCard"
import { tiltCardSkin } from "@/components/tilt-card-styles"
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

const CARD = `bg-card flex h-full min-h-28 rounded-lg border ${tiltCardSkin()}`

export function CampaignCard({ campaign, members, onLeave }: Props) {
  return (
    <TiltCard className={CARD}>
      <div className="w-28 shrink-0 self-stretch overflow-hidden rounded-l-[inherit] sm:w-32">
        <CampaignImage
          name={campaign.name}
          imageUrl={campaign.imageUrl}
          className="size-full rounded-none border-0"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 p-4">
        <div className="flex items-start gap-2">
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
          <div className="relative z-20 -mt-1 -mr-2">
            <CampaignMenu campaign={campaign} onLeave={onLeave} />
          </div>
        </div>
        <CampaignMemberStack members={members} />
      </div>
    </TiltCard>
  )
}
