import { Navigate, Outlet } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { useCampaign } from "./useCampaign"

// Wraps the pages that only make sense inside a campaign. Someone with none
// is sent to the Campaigns page, which is still inside the app.
export function RequireCampaign() {
  const { current, loading } = useCampaign()

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="text-muted-foreground size-5 animate-spin" />
      </div>
    )
  }

  return current ? <Outlet /> : <Navigate to="/app/campaigns" replace />
}
