import { useCampaignMembers } from "@/hooks/use-campaign-members"
import type { Campaign } from "@/lib/campaigns"
import { BentoTile } from "./BentoTile"
import type { BentoArea } from "./BentoTile"
import { CampaignOrbit } from "./CampaignOrbit"
import { ContinueCampaign } from "./ContinueCampaign"
import { HomeCardBody } from "./HomeCardBody"
import { InviteField } from "./InviteField"

type Props = {
  // The wide place in the bento it takes.
  area: BentoArea
  // The campaign to go back to; null for a new player.
  campaign: Campaign | null
  // When it was last opened, in milliseconds; null when that was not remembered.
  openedAt: number | null
}

// The wide tile with the last campaign's party orbiting a seal (dots for a new player): first in the
// bento, the way back into the last campaign; or for a new player, further down, a way to join one.
export function ContinueTile({ area, campaign, openedAt }: Props) {
  const members = useCampaignMembers(campaign ? [campaign] : [])[campaign?.id ?? ""]
  return (
    <BentoTile area={area} wide art={<CampaignOrbit members={campaign ? members : []} className="absolute top-1/2 left-1/2 h-[82%] -translate-x-1/2 -translate-y-1/2" />}>
      {campaign ? (
        <ContinueCampaign campaign={campaign} openedAt={openedAt} />
      ) : (
        <HomeCardBody title="Join a campaign" line="Paste the invite link your GM sent you." actions={<InviteField />} />
      )}
    </BentoTile>
  )
}
