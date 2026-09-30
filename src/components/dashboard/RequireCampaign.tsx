import { Outlet } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { NoCampaignState } from "./NoCampaignState"
import { useCampaign } from "./useCampaign"

// Wraps the pages that only make sense inside a campaign.
export function RequireCampaign() {
  const { current, loading } = useCampaign()

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="text-muted-foreground size-5 animate-spin" />
      </div>
    )
  }

  return current ? <Outlet /> : <NoCampaignState />
}
