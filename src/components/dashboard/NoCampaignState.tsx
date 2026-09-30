import { Link } from "react-router-dom"
import globe from "@/assets/icons/globe.svg"
import { Icon } from "@/components/Icon"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export function NoCampaignState() {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon src={globe} className="size-6" />
        </EmptyMedia>
        <EmptyTitle>No campaign yet</EmptyTitle>
        <EmptyDescription>
          Create a campaign to run your own, or join one with an invite link
          from your GM.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <Button asChild>
          <Link to="/app/campaigns/new">Create a campaign</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/app/campaigns/join">Join with invite link</Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
