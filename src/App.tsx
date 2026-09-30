import { Navigate, Route, Routes } from "react-router-dom"
import { CampaignShell } from "@/components/dashboard/CampaignShell"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { RequireCampaign } from "@/components/dashboard/RequireCampaign"
import { CampaignSettings } from "@/pages/CampaignSettings"
import { CampaignSettingsAdvanced } from "@/pages/CampaignSettingsAdvanced"
import { CampaignSettingsGeneral } from "@/pages/CampaignSettingsGeneral"
import { CampaignSettingsMembers } from "@/pages/CampaignSettingsMembers"
import { Campaigns } from "@/pages/Campaigns"
import { Characters } from "@/pages/Characters"
import { Home } from "@/pages/Home"
import { Invite } from "@/pages/Invite"
import { JoinCampaign } from "@/pages/JoinCampaign"
import { Library } from "@/pages/Library"
import { Login } from "@/pages/Login"
import { NewCampaign } from "@/pages/NewCampaign"
import { Overview } from "@/pages/Overview"
import { Party } from "@/pages/Party"
import { Sessions } from "@/pages/Sessions"
import { Settings } from "@/pages/Settings"
import { SettingsAppearance } from "@/pages/SettingsAppearance"
import { SettingsBilling } from "@/pages/SettingsBilling"
import { SettingsNotifications } from "@/pages/SettingsNotifications"
import { SettingsPassword } from "@/pages/SettingsPassword"
import { SettingsProfile } from "@/pages/SettingsProfile"
import { Signup } from "@/pages/Signup"
import { Support } from "@/pages/Support"
import { World } from "@/pages/World"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/invite" element={<Invite />} />
      <Route element={<CampaignShell />}>
        <Route path="/app" element={<DashboardLayout />}>
          <Route element={<RequireCampaign />}>
            <Route index element={<Overview />} />
            <Route path="world" element={<World />} />
            <Route path="sessions" element={<Sessions />} />
            <Route path="characters" element={<Characters />} />
            <Route path="party" element={<Party />} />
            <Route path="campaign-settings" element={<CampaignSettings />}>
              <Route index element={<Navigate to="general" replace />} />
              <Route path="general" element={<CampaignSettingsGeneral />} />
              <Route path="members" element={<CampaignSettingsMembers />} />
              <Route path="advanced" element={<CampaignSettingsAdvanced />} />
            </Route>
          </Route>
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="campaigns/new" element={<NewCampaign />} />
          <Route path="campaigns/join" element={<JoinCampaign />} />
          <Route path="library" element={<Library />} />
          <Route path="settings" element={<Settings />}>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<SettingsProfile />} />
            <Route path="appearance" element={<SettingsAppearance />} />
            <Route path="password" element={<SettingsPassword />} />
            <Route path="notifications" element={<SettingsNotifications />} />
            <Route path="billing" element={<SettingsBilling />} />
          </Route>
          <Route path="support" element={<Support />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
