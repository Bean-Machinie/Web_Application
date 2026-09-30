import { Badge } from "@/components/ui/badge"
import { TabNav } from "./TabNav"
import { useCampaign } from "./useCampaign"

export function SettingsTabs() {
  const pending = useCampaign().unreadCount

  const tabs = [
    { label: "Profile", to: "/app/settings/profile" },
    { label: "Appearance", to: "/app/settings/appearance" },
    { label: "Password", to: "/app/settings/password" },
    {
      label: "Notifications",
      to: "/app/settings/notifications",
      badge: pending > 0 && (
        <Badge className="h-5 min-w-5 rounded-full px-1.5">{pending}</Badge>
      ),
    },
    { label: "Billing", to: "/app/settings/billing" },
  ]

  return <TabNav label="Settings" tabs={tabs} />
}
