import type { MouseEvent } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useCampaignMembers } from "@/hooks/use-campaign-members"
import type { Campaign } from "@/lib/campaigns"
import { BentoTile } from "./BentoTile"
import type { BentoArea } from "./BentoTile"
import { CampaignOrbit } from "./CampaignOrbit"
import { centreOf, useDitherRipple } from "./dither-ripple"
import { HomeCardBody } from "./HomeCardBody"
import { InviteField } from "./InviteField"

// The wide tile to start a campaign, with the last campaign's party orbiting a seal (dots for a new
// player): first in the bento for someone with no campaign yet, further down once they play, when it
// also takes an invite, as the Continue tile offers that to a new player.
export function NewCampaignTile({ area, campaign }: { area: BentoArea; campaign: Campaign | null }) {
  const members = useCampaignMembers(campaign ? [campaign] : [])[campaign?.id ?? ""]
  const triggerRipple = useDitherRipple()
  // A press from the keyboard has no pointer position, so it ripples from the button's middle.
  const ripple = (event: MouseEvent<HTMLAnchorElement>) => triggerRipple(...(event.detail === 0 ? centreOf(event.currentTarget) : ([event.clientX, event.clientY] as const)))

  const start = (
    <Button asChild size="lg">
      <Link to="/app/campaigns/new" onClick={ripple}>
        New campaign
      </Link>
    </Button>
  )

  return (
    <BentoTile area={area} wide art={<CampaignOrbit members={campaign ? members : []} className="absolute top-1/2 left-1/2 h-[82%] -translate-x-1/2 -translate-y-1/2" />}>
      {campaign ? (
        <HomeCardBody title="New campaign" line="Start one, or paste an invite link." actions={<>{start}<InviteField /></>} />
      ) : (
        <HomeCardBody title="Run your own game" line="Create a campaign and invite your players." actions={start} />
      )}
    </BentoTile>
  )
}
