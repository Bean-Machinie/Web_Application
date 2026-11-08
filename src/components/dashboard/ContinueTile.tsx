import type { Campaign } from "@/lib/campaigns"
import { BentoTile } from "./BentoTile"
import { ContinueCampaign } from "./ContinueCampaign"
import { DottedD20 } from "./DottedD20"
import { HomeCardBody } from "./HomeCardBody"
import { InviteField } from "./InviteField"

type Props = {
  // The campaign to go back to; null for a new player.
  campaign: Campaign | null
  // When it was last opened, in milliseconds; null when that was not remembered.
  openedAt: number | null
}

// The wide first tile, with a dotted d20 turning at the right: the way back into the last campaign, or
// for a new player a way to join one.
export function ContinueTile({ campaign, openedAt }: Props) {
  return (
    <BentoTile className="md:col-span-2" art={<DottedD20 className="absolute inset-0 size-full" />}>
      {campaign ? (
        <ContinueCampaign campaign={campaign} openedAt={openedAt} />
      ) : (
        <HomeCardBody title="Join a campaign" line="Paste the invite link your GM sent you." actions={<InviteField />} />
      )}
    </BentoTile>
  )
}
