import { Bell, CreditCard, Lock, Palette, User } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export const SETTINGS_TABS = [
  { id: "profile", group: "Account", label: "Profile", description: "Your photo and the details others see.", icon: User },
  { id: "password", group: "Account", label: "Password", description: "Choose a new password for your account.", icon: Lock },
  { id: "appearance", group: "Preferences", label: "Appearance", description: "Choose how the workspace looks on this device.", icon: Palette },
  { id: "notifications", group: "Preferences", label: "Notifications", description: "Invitations and campaign updates.", icon: Bell },
  { id: "billing", group: "Billing", label: "Billing", description: "Your plan, payment method and invoices.", icon: CreditCard },
] as const satisfies readonly { id: string; group: string; label: string; description: string; icon: LucideIcon }[]

export type SettingsTab = (typeof SETTINGS_TABS)[number]["id"]

export const SETTINGS_GROUPS = ["Account", "Preferences", "Billing"].map((label) => ({
  label,
  tabs: SETTINGS_TABS.filter((tab) => tab.group === label),
}))
