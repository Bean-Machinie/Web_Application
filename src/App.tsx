import { Navigate, Route, Routes } from "react-router-dom"
import { RequireAuth } from "@/auth/RequireAuth"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Analytics } from "@/pages/Analytics"
import { Home } from "@/pages/Home"
import { Login } from "@/pages/Login"
import { Overview } from "@/pages/Overview"
import { Projects } from "@/pages/Projects"
import { Settings } from "@/pages/Settings"
import { SettingsAppearance } from "@/pages/SettingsAppearance"
import { SettingsBilling } from "@/pages/SettingsBilling"
import { SettingsNotifications } from "@/pages/SettingsNotifications"
import { SettingsPassword } from "@/pages/SettingsPassword"
import { SettingsProfile } from "@/pages/SettingsProfile"
import { Signup } from "@/pages/Signup"
import { Support } from "@/pages/Support"
import { Team } from "@/pages/Team"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/app"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Overview />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="projects" element={<Projects />} />
        <Route path="team" element={<Team />} />
        <Route path="settings" element={<Settings />}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<SettingsProfile />} />
          <Route path="password" element={<SettingsPassword />} />
          <Route path="appearance" element={<SettingsAppearance />} />
          <Route path="notifications" element={<SettingsNotifications />} />
          <Route path="billing" element={<SettingsBilling />} />
        </Route>
        <Route path="support" element={<Support />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
