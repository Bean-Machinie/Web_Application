import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { useSettingsWindow } from "@/hooks/use-settings-window"
import { SettingsAppearance } from "@/pages/SettingsAppearance"
import { SettingsBilling } from "@/pages/SettingsBilling"
import { SettingsNotifications } from "@/pages/SettingsNotifications"
import { SettingsPassword } from "@/pages/SettingsPassword"
import { SettingsProfile } from "@/pages/SettingsProfile"
import { SettingsNav } from "./SettingsNav"
import { SETTINGS_TABS } from "./settings-tabs"
import type { SettingsTab } from "./settings-tabs"

const CONTENT: Record<SettingsTab, () => React.ReactNode> = {
  profile: () => <SettingsProfile />,
  appearance: () => <SettingsAppearance />,
  password: () => <SettingsPassword />,
  notifications: () => <SettingsNotifications />,
  billing: () => <SettingsBilling />,
}

// Account settings as a window over the page, shown when the address has "?settings=" (see
// use-settings-window.ts). Mounted once, for every page that has a signed-in user.
export function SettingsWindow() {
  const { tab, open, close } = useSettingsWindow()
  const active = tab ?? "profile"
  const label = SETTINGS_TABS.find(({ id }) => id === active)!.label

  return (
    <Dialog open={tab !== null} onOpenChange={(next) => !next && close()}>
      <DialogContent className="flex h-[min(44rem,calc(100dvh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl md:flex-row">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">Your account and workspace preferences.</DialogDescription>
        <SettingsNav tab={active} onPick={open} />
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-2xl px-6 py-6 md:px-8 md:py-8">
            <h3 className="text-xl font-semibold tracking-tight">{label}</h3>
            {CONTENT[active]()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
