import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"

export function CampaignNotFound() {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader className="gap-3">
        <EmptyTitle className="text-xl">Campaign not found</EmptyTitle>
        <EmptyDescription>
          This campaign does not exist, or you are not a member of it.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link to="/app">Back to campaigns</Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
