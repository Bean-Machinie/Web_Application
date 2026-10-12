import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SettingsAppearance } from "@/pages/SettingsAppearance"
import { SettingsBilling } from "@/pages/SettingsBilling"
import { SettingsNotifications } from "@/pages/SettingsNotifications"
import { SettingsPassword } from "@/pages/SettingsPassword"
import { SettingsProfile } from "@/pages/SettingsProfile"
import type { SettingsTab } from "./settings-tabs"

const CONTENT: Record<SettingsTab, () => React.ReactNode> = {
  profile: () => <SettingsProfile />,
  appearance: () => <SettingsAppearance />,
  password: () => <SettingsPassword />,
  notifications: () => <SettingsNotifications />,
  billing: () => <SettingsBilling />,
}

// One tab's settings. The navigation says which tab this is. Only this scrolls.
export function SettingsContent({ tab, onBack }: { tab: SettingsTab; onBack: () => void }) {
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
          {CONTENT[tab]()}
        </div>
      </ScrollArea>
    </>
  )
}
