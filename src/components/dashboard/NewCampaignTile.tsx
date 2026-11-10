import type { MouseEvent } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import type { Campaign } from "@/lib/campaigns"
import { BentoTile } from "./BentoTile"
import type { BentoArea } from "./BentoTile"
import { centreOf, useDitherRipple } from "./dither-ripple"
import { DottedD20 } from "./DottedD20"
import { HomeCardBody } from "./HomeCardBody"
import { InviteField } from "./InviteField"

// The wide tile to start a campaign, with a large dotted d20 globe in its bottom right corner, mostly
// cut off by the card: first in the bento for someone with no campaign yet, further down once they play,
// when it also takes an invite, as the Continue tile offers that to a new player.
export function NewCampaignTile({ area, campaign, square = false }: { area: BentoArea; campaign: Campaign | null; square?: boolean }) {
  const triggerRipple = useDitherRipple()
  // A press from the keyboard has no pointer position, so it ripples from the button's middle.
  const ripple = (event: MouseEvent<HTMLAnchorElement>) => triggerRipple(...(event.detail === 0 ? centreOf(event.currentTarget) : ([event.clientX, event.clientY] as const)))

  const start = (
    <Button asChild>
      <Link to="/app/campaigns/new" onClick={ripple}>
        New campaign
      </Link>
    </Button>
  )

  return (
    <BentoTile area={area} wide={!square} art={<DottedD20 className="absolute top-[8%] right-0 aspect-square h-[140%] translate-x-[30%]" />}>
      {campaign ? (
        <HomeCardBody title="New campaign" line="Start one, or paste an invite link." actions={<>{start}<InviteField secondary /></>} />
      ) : (
        <HomeCardBody title="Run your own game" line="Create a campaign and invite your players." actions={start} />
      )}
    </BentoTile>
  )
}
