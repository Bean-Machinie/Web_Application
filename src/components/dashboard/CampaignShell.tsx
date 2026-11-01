import { Outlet } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { RequireAuth } from "@/auth/RequireAuth"
import { CampaignProvider } from "./CampaignProvider"
import { NotificationsPanel } from "./NotificationsPanel"
import { SettingsWindow } from "./SettingsWindow"
import { ShellGate } from "./ShellGate"

// Everything that needs a signed-in user and knowledge of their campaigns.
export function CampaignShell() {
  return (
    <RequireAuth>
      <CampaignProvider>
        <ShellGate>
          <Outlet />
          <SettingsWindow />
          <NotificationsPanel />
          <Toaster />
        </ShellGate>
      </CampaignProvider>
    </RequireAuth>
  )
}
