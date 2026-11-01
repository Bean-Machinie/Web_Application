import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SettingsAppearance } from "@/pages/SettingsAppearance"
import { SettingsBilling } from "@/pages/SettingsBilling"
import { SettingsNotifications } from "@/pages/SettingsNotifications"
import { SettingsProfile } from "@/pages/SettingsProfile"
import { SettingsSecurity } from "@/pages/SettingsSecurity"
import { SETTINGS_TABS } from "./settings-tabs"
import type { SettingsTab } from "./settings-tabs"

const CONTENT: Record<SettingsTab, () => React.ReactNode> = {
  profile: () => <SettingsProfile />,
  appearance: () => <SettingsAppearance />,
  security: () => <SettingsSecurity />,
  notifications: () => <SettingsNotifications />,
  billing: () => <SettingsBilling />,
}

// One tab's settings. The navigation says which tab this is. Only this scrolls.
export function SettingsContent({ tab, onBack }: { tab: SettingsTab; onBack: () => void }) {
  const meta = SETTINGS_TABS.find((entry) => entry.id === tab)!

  return (
    <>
      <Button variant="ghost" size="sm" className="absolute top-2 left-2 z-10 md:hidden" onClick={onBack}>
        <ArrowLeft className="size-4" />
        Settings
      </Button>
      {/* Inset from the window's edge and below the close button, so the scrollbar is neither
          along the border nor under the X. It shows only while scrolling. */}
      <ScrollArea type="scroll" className="mt-12 mr-1.5 mb-3 min-h-0 flex-1">
        <div className="mx-auto w-full max-w-2xl px-4 pb-28 md:px-8">
          <header className="mb-6">
            <h2 className="text-lg font-semibold tracking-tight">{meta.label}</h2>
            <p className="text-muted-foreground text-sm">{meta.description}</p>
          </header>
          {CONTENT[tab]()}
        </div>
      </ScrollArea>
    </>
  )
}
