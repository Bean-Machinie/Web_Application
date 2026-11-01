import { Switch } from "@/components/ui/switch"
import { useNotificationPrefs } from "@/hooks/use-notification-prefs"
import type { NotificationPref } from "@/hooks/use-notification-prefs"
import { SettingsGroup } from "./SettingsGroup"
import { SettingsRow } from "./SettingsRow"

const GROUPS: { label: string; items: { pref: NotificationPref; title: string; description: string }[] }[] = [
  {
    label: "Invitations",
    items: [{ pref: "invitations", title: "Campaign invitations", description: "When someone invites you in." }],
  },
  {
    label: "Members",
    items: [
      { pref: "memberLeft", title: "Someone leaves", description: "When a member leaves your campaign." },
      { pref: "removed", title: "You are removed", description: "When a GM removes you from a campaign." },
    ],
  },
  {
    label: "Campaigns",
    items: [
      { pref: "campaignDeleted", title: "Campaign deleted", description: "When one of your campaigns is deleted." },
      { pref: "ownership", title: "Ownership changes", description: "When a campaign is handed over." },
    ],
  },
]

// Instant settings: each switch is saved as it is flipped, so they never raise the save bar.
export function NotificationToggles() {
  const { prefs, set } = useNotificationPrefs()

  return (
    <div className="flex flex-col gap-10">
      {GROUPS.map((group) => (
        <SettingsGroup key={group.label} title={group.label}>
          {group.items.map(({ pref, title, description }) => (
            <SettingsRow key={pref} center title={title} description={description}>
              <Switch
                aria-label={title}
                checked={prefs[pref]}
                onCheckedChange={(on) => set(pref, on)}
              />
            </SettingsRow>
          ))}
        </SettingsGroup>
      ))}
    </div>
  )
}
