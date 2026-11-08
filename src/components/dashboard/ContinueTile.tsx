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

// The wide tile with a large dotted d20 globe in its bottom right corner, mostly cut off by the card:
// first in the bento, the way back into the last campaign; or for a new player, further down, a way to
// join one.
export function ContinueTile({ area, campaign, openedAt }: Props) {
  return (
    <BentoTile area={area} wide art={<DottedD20 className="absolute top-[8%] right-0 aspect-square h-[140%] translate-x-[30%]" />}>
      {campaign ? (
        <ContinueCampaign campaign={campaign} openedAt={openedAt} />
      ) : (
        <HomeCardBody title="Join a campaign" line="Paste the invite link your GM sent you." actions={<InviteField />} />
      )}
    </BentoTile>
  )
}
