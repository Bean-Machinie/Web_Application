import bell from "@/assets/icons/bell.svg"
import desktop from "@/assets/icons/desktop.svg"
import file from "@/assets/icons/file.svg"
import settings from "@/assets/icons/settings.svg"
import shieldLock from "@/assets/icons/shield-lock.svg"

// Profile, Appearance and Billing use the same icons as the account menu that opens them.

export const SETTINGS_TABS = [
  { id: "profile", group: "Account", label: "Profile", description: "Your photo and the details others see.", icon: settings },
  { id: "security", group: "Account", label: "Security", description: "Your email, password and the accounts you can log in with.", icon: shieldLock },
  { id: "appearance", group: "Preferences", label: "Appearance", description: "Choose how the workspace looks on this device.", icon: desktop },
  { id: "notifications", group: "Preferences", label: "Notifications", description: "Invitations and campaign updates.", icon: bell },
  { id: "billing", group: "Billing", label: "Billing", description: "Your plan, payment method and invoices.", icon: file },
] as const satisfies readonly { id: string; group: string; label: string; description: string; icon: string }[]

export type SettingsTab = (typeof SETTINGS_TABS)[number]["id"]

// A guest has no email or password to secure, and no plan to pay for.
export const GUEST_HIDDEN: readonly SettingsTab[] = ["security", "billing"]

export const settingsGroups = (isGuest: boolean) =>
  ["Account", "Preferences", "Billing"]
    .map((label) => ({
      label,
      tabs: SETTINGS_TABS.filter(
        (tab) => tab.group === label && !(isGuest && GUEST_HIDDEN.includes(tab.id))
      ),
    }))
    .filter((group) => group.tabs.length > 0)
