import { Outlet } from "react-router-dom"
import { RequireAuth } from "@/auth/RequireAuth"
import { CampaignProvider } from "./CampaignProvider"
import { SettingsWindow } from "./SettingsWindow"

// Everything that needs a signed-in user and knowledge of their campaigns.
export function CampaignShell() {
  return (
    <RequireAuth>
      <CampaignProvider>
        <Outlet />
        <SettingsWindow />
      </CampaignProvider>
    </RequireAuth>
  )
}
