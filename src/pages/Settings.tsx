import { Outlet } from "react-router-dom"
import { SettingsTabs } from "@/components/dashboard/SettingsTabs"

export function Settings() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col">
      <div className="pb-6">
        <h2 className="text-xl font-semibold tracking-tight">Settings</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your account and workspace preferences.
        </p>
      </div>
      <SettingsTabs />
      <Outlet />
    </div>
  )
}
