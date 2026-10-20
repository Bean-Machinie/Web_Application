import box from "@/assets/icons/box.svg"
import characters from "@/assets/icons/menu-profile.svg"
import desktop from "@/assets/icons/desktop.svg"
import file from "@/assets/icons/file.svg"
import globe from "@/assets/icons/globe.svg"
import settings from "@/assets/icons/settings.svg"
import userGroup from "@/assets/icons/user-group.svg"
import { campaignPath } from "@/lib/campaign-paths"

export type NavItem = {
  title: string
  to: string
  icon: string
  badge?: string
  // Only the page itself lights the item, not the pages below it.
  exact?: boolean
}

export const campaignNav = (id: string): NavItem[] => [
  { title: "Overview", to: campaignPath(id), icon: desktop, exact: true },
  { title: "World", to: campaignPath(id, "world"), icon: globe },
  { title: "Sessions", to: campaignPath(id, "sessions"), icon: file },
  { title: "Characters", to: campaignPath(id, "characters"), icon: characters },
  { title: "Party", to: campaignPath(id, "party"), icon: userGroup },
]

export const campaignSettingsNav = (id: string): NavItem[] => [
  { title: "Campaign settings", to: campaignPath(id, "campaign-settings"), icon: settings },
]

// What the sidebar shows outside a campaign.
export const homeNav: NavItem[] = [
  { title: "Campaigns", to: "/app", icon: globe, exact: true },
  { title: "Your library", to: "/app/library", icon: box },
]
