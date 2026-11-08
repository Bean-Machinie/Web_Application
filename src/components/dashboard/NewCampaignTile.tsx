import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { BentoTile } from "./BentoTile"
import { HomeCardBody } from "./HomeCardBody"
import { InviteField } from "./InviteField"

// The tile to start a campaign; someone who already plays can also paste an invite here, as the
// Continue tile offers that to a new player.
export function NewCampaignTile({ returning }: { returning: boolean }) {
  const start = (
    <Button asChild size="lg">
      <Link to="/app/campaigns/new">New campaign</Link>
    </Button>
  )

  return (
    <BentoTile>
      {returning ? (
        <HomeCardBody title="New campaign" line="Start one, or paste an invite link." actions={<>{start}<InviteField /></>} />
      ) : (
        <HomeCardBody title="Run your own game" line="Create a campaign and invite your players." actions={start} />
      )}
    </BentoTile>
  )
}
