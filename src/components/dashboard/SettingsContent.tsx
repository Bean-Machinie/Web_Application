import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SettingsAppearance } from "@/pages/SettingsAppearance"
import { SettingsBilling } from "@/pages/SettingsBilling"
import { SettingsNotifications } from "@/pages/SettingsNotifications"
import { SettingsPassword } from "@/pages/SettingsPassword"
import { SettingsProfile } from "@/pages/SettingsProfile"
import { SETTINGS_TABS } from "./settings-tabs"
import type { SettingsTab } from "./settings-tabs"

const CONTENT: Record<SettingsTab, () => React.ReactNode> = {
  profile: () => <SettingsProfile />,
  appearance: () => <SettingsAppearance />,
  password: () => <SettingsPassword />,
  notifications: () => <SettingsNotifications />,
  billing: () => <SettingsBilling />,
}

// One tab: its title and one-line description, then its settings. Only this scrolls.
export function SettingsContent({ tab, onBack }: { tab: SettingsTab; onBack: () => void }) {
  const { label, description } = SETTINGS_TABS.find(({ id }) => id === tab)!

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-4 pt-4 pb-28 md:px-8 md:pt-10">
        <Button variant="ghost" size="sm" className="-ml-2 mb-3 md:hidden" onClick={onBack}>
          <ArrowLeft className="size-4" />
          Settings
        </Button>
        <header className="mb-6 pr-8">
          <h3 className="text-2xl font-semibold tracking-tight">{label}</h3>
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        </header>
        {CONTENT[tab]()}
      </div>
    </div>
  )
}
