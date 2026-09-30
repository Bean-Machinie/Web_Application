import { Outlet } from "react-router-dom"
import { RequireAuth } from "@/auth/RequireAuth"
import { CampaignProvider } from "./CampaignProvider"

// Everything that needs a signed-in user and knowledge of their campaigns.
export function CampaignShell() {
  return (
    <RequireAuth>
      <CampaignProvider>
        <Outlet />
      </CampaignProvider>
    </RequireAuth>
  )
}
