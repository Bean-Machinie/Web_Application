import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"

// Shown when you belong to no campaign yet.
export function CampaignEmpty({ onJoin }: { onJoin: () => void }) {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyTitle>No campaigns yet</EmptyTitle>
        <EmptyDescription>
          Start a campaign of your own as its GM, or join one with an invite link from your GM.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center">
        <Button asChild>
          <Link to="/app/campaigns/new">New campaign</Link>
        </Button>
        <Button variant="outline" onClick={onJoin}>
          Join with invite link
        </Button>
      </EmptyContent>
    </Empty>
  )
}
