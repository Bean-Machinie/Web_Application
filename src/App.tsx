import { Navigate, Route, Routes } from "react-router-dom"
import { CampaignScope } from "@/components/dashboard/CampaignScope"
import { CampaignShell } from "@/components/dashboard/CampaignShell"
import { CampaignWorldScope } from "@/components/dashboard/CampaignWorldScope"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { LibraryWorldScope } from "@/components/dashboard/LibraryWorldScope"
import { CampaignSettings } from "@/pages/CampaignSettings"
import { CampaignSettingsAdvanced } from "@/pages/CampaignSettingsAdvanced"
import { CampaignSettingsGeneral } from "@/pages/CampaignSettingsGeneral"
import { CampaignSettingsMembers } from "@/pages/CampaignSettingsMembers"
import { Campaigns } from "@/pages/Campaigns"
import { CharacterBuilderRoute } from "@/pages/CharacterBuilder"
import { CharacterStartRoute } from "@/pages/CharacterStart"
import { CharacterSheetPage } from "@/pages/CharacterSheet"
import { Characters } from "@/pages/Characters"
import { Create } from "@/pages/Create"
import { Home } from "@/pages/Home"
import { Invite } from "@/pages/Invite"
import { JoinCampaign } from "@/pages/JoinCampaign"
import { Legal } from "@/pages/Legal"
import { Library } from "@/pages/Library"
import { Login } from "@/pages/Login"
import { MapBuild } from "@/pages/MapBuild"
import { NewCampaign } from "@/pages/NewCampaign"
import { Overview } from "@/pages/Overview"
import { Party } from "@/pages/Party"
import { Sessions } from "@/pages/Sessions"
import { SettingsRedirect } from "@/pages/SettingsRedirect"
import { Signup } from "@/pages/Signup"
import { Support } from "@/pages/Support"
import { World } from "@/pages/World"
import { WorldEntry } from "@/pages/WorldEntry"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/invite" element={<Invite />} />
      <Route element={<CampaignShell />}>
        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<Campaigns />} />
          <Route path="campaigns/new" element={<NewCampaign />} />
          <Route path="campaigns/join" element={<JoinCampaign />} />
          <Route path="c/:campaignId" element={<CampaignScope />}>
            <Route index element={<Overview />} />
            <Route element={<CampaignWorldScope />}>
              <Route path="world" element={<World />} />
              <Route path="world/:entryId" element={<WorldEntry />} />
              <Route path="world/:entryId/build" element={<MapBuild />} />
            </Route>
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
          <Route path="characters/:characterId" element={<CharacterSheetPage />} />
          <Route path="characters/:characterId/start" element={<CharacterStartRoute />} />
          <Route path="characters/:characterId/build" element={<CharacterBuilderRoute />} />
          <Route path="create" element={<LibraryWorldScope />}>
            <Route index element={<Create />} />
          </Route>
          <Route path="library" element={<LibraryWorldScope />}>
            <Route index element={<Library />} />
            <Route path=":entryId" element={<WorldEntry />} />
            <Route path=":entryId/build" element={<MapBuild />} />
          </Route>
          <Route path="settings" element={<SettingsRedirect />} />
          <Route path="settings/:tab" element={<SettingsRedirect />} />
          <Route path="support" element={<Support />} />
          <Route path="legal" element={<Legal />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
