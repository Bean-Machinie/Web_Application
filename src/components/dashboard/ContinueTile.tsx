import type { Campaign } from "@/lib/campaigns"
import { BentoTile } from "./BentoTile"
import type { BentoArea } from "./BentoTile"
import { ContinueCampaign } from "./ContinueCampaign"
import { DottedD20 } from "./DottedD20"
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

// The wide tile with a large dotted d20 turning at the bottom right: first in the bento, the way back
// into the last campaign; or for a new player, further down, a way to join one.
export function ContinueTile({ area, campaign, openedAt }: Props) {
  return (
    // The die is 1.4 times the tile's height, its centre near the bottom right corner (0.3 of the height
    // in from the right, 0.8 down), so the card cuts most of it off.
    <BentoTile area={area} wide art={<DottedD20 className="absolute top-[10%] right-0 aspect-square h-[140%] translate-x-[28.6%]" />}>
      {campaign ? (
        <ContinueCampaign campaign={campaign} openedAt={openedAt} />
      ) : (
        <HomeCardBody title="Join a campaign" line="Paste the invite link your GM sent you." actions={<InviteField />} />
      )}
    </BentoTile>
  )
}
