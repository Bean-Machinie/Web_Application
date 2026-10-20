import { Link } from "react-router-dom"
import { TiltCard } from "@/components/TiltCard"
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

// The tilt and scale come from TiltCard. Only transform and opacity animate. The lighter fill, border and top
// highlight live on ::before and the deeper shadow on ::after, and each fades
// in. Slower out (250ms) than in (150ms) leaves a soft trail when sweeping.
const FADE_IN = "hover:before:opacity-100 hover:after:opacity-100 has-[a:focus-visible]:before:opacity-100 has-[a:focus-visible]:after:opacity-100"
const LAYER = "before:pointer-events-none after:pointer-events-none before:absolute after:absolute before:-inset-px after:-inset-px before:-z-10 after:-z-10 before:rounded-[inherit] after:rounded-[inherit] before:opacity-0 after:opacity-0 before:transition-opacity after:transition-opacity before:duration-250 after:duration-250 before:ease-out after:ease-out hover:before:duration-150 hover:after:duration-150 before:content-[''] after:content-['']"
const SKIN =
  "before:border before:border-foreground/20 before:bg-foreground/[0.03] before:shadow-[inset_0_1px_0_color-mix(in_oklab,var(--foreground)_8%,transparent)] after:shadow-[0_12px_28px_-8px_rgb(0_0_0/0.35)]"
const CARD = `bg-card relative isolate flex h-full flex-col justify-between gap-6 rounded-lg border p-4 ${LAYER} ${SKIN} ${FADE_IN}`

export function CampaignCard({ campaign, members, onLeave }: Props) {
  return (
    <TiltCard className={CARD}>
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
    </TiltCard>
  )
}
