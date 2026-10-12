import { Bell, CreditCard, Lock, Palette, User } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export const SETTINGS_TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "password", label: "Password", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing", icon: CreditCard },
] as const satisfies readonly { id: string; label: string; icon: LucideIcon }[]

export type SettingsTab = (typeof SETTINGS_TABS)[number]["id"]
