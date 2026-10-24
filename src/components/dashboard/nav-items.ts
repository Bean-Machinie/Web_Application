import type { AnimatedIconComponent } from "@/components/AnimatedIcon"
import { BoxIcon } from "@/components/BoxIcon"
import { FileIcon } from "@/components/FileIcon"
import { GlobeIcon } from "@/components/GlobeIcon"
import { LifeBuoyIcon } from "@/components/LifeBuoyIcon"
import { MonitorIcon } from "@/components/MonitorIcon"
import { PencilRulerIcon } from "@/components/PencilRulerIcon"
import { SettingsIcon } from "@/components/SettingsIcon"
import { UserIcon } from "@/components/UserIcon"
import { UsersIcon } from "@/components/UsersIcon"
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
  { title: "World", to: campaignPath(id, "world"), icon: GlobeIcon },
  { title: "Sessions", to: campaignPath(id, "sessions"), icon: FileIcon },
  { title: "Characters", to: campaignPath(id, "characters"), icon: UserIcon },
  { title: "Party", to: campaignPath(id, "party"), icon: UsersIcon },
]

export const campaignSettingsNav = (id: string): NavItem[] => [
  { title: "Campaign settings", to: campaignPath(id, "campaign-settings"), icon: SettingsIcon },
]

// What the sidebar shows outside a campaign.
export const homeNav: NavItem[] = [
  { title: "Home", to: "/app", icon: GlobeIcon, exact: true },
  { title: "Create", to: "/app/create", icon: PencilRulerIcon },
  { title: "Your library", to: "/app/library", icon: BoxIcon },
]

// The pages the command palette offers everywhere.
export const mainPages = [...homeNav, { title: "Support", to: "/app/support", icon: LifeBuoyIcon }]
