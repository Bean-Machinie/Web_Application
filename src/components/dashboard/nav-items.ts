import type { AnimatedIconComponent } from "@/components/AnimatedIcon"
import { CalendarFoldIcon } from "@/components/icons/CalendarFoldIcon"
import { LayoutGridIcon } from "@/components/icons/LayoutGridIcon"
import { LifeBuoyIcon } from "@/components/icons/LifeBuoyIcon"
import { MonitorIcon } from "@/components/icons/MonitorIcon"
import { PackageIcon } from "@/components/icons/PackageIcon"
import { PlusIcon } from "@/components/icons/PlusIcon"
import { ScrollTextIcon } from "@/components/icons/ScrollTextIcon"
import { SettingsIcon } from "@/components/icons/SettingsIcon"
import { UserRoundIcon } from "@/components/icons/UserRoundIcon"
import { UsersRoundIcon } from "@/components/icons/UsersRoundIcon"
import { campaignPath } from "@/lib/campaign-paths"

export type NavItem = {
  title: string
  to: string
  icon: AnimatedIconComponent
  badge?: string
  // Only the page itself lights the item, not the pages below it.
  exact?: boolean
}

export const campaignNav = (id: string): NavItem[] => [
  { title: "Overview", to: campaignPath(id), icon: MonitorIcon, exact: true },
  { title: "World", to: campaignPath(id, "world"), icon: ScrollTextIcon },
  { title: "Sessions", to: campaignPath(id, "sessions"), icon: CalendarFoldIcon },
  { title: "Characters", to: campaignPath(id, "characters"), icon: UserRoundIcon },
  { title: "Party", to: campaignPath(id, "party"), icon: UsersRoundIcon },
]

export const campaignSettingsNav = (id: string): NavItem[] => [
  { title: "Campaign settings", to: campaignPath(id, "campaign-settings"), icon: SettingsIcon },
]

// What the sidebar shows outside a campaign.
export const homeNav: NavItem[] = [
  { title: "Home", to: "/app", icon: LayoutGridIcon, exact: true },
  { title: "Create", to: "/app/create", icon: PlusIcon },
  { title: "Your library", to: "/app/library", icon: PackageIcon },
]

// The pages the command palette offers everywhere.
export const mainPages = [...homeNav, { title: "Support", to: "/app/support", icon: LifeBuoyIcon }]
