import box from "@/assets/icons/box.svg"
import characters from "@/assets/icons/menu-profile.svg"
import desktop from "@/assets/icons/desktop.svg"
import file from "@/assets/icons/file.svg"
import globe from "@/assets/icons/globe.svg"
import settings from "@/assets/icons/settings.svg"
import userGroup from "@/assets/icons/user-group.svg"

export type NavItem = {
  title: string
  to: string
  icon: string
  badge?: string
}

export const campaignNav: NavItem[] = [
  { title: "Overview", to: "/app", icon: desktop },
  { title: "World", to: "/app/world", icon: globe },
  { title: "Sessions", to: "/app/sessions", icon: file },
  { title: "Characters", to: "/app/characters", icon: characters },
  { title: "Party", to: "/app/party", icon: userGroup },
]

export const libraryNav: NavItem[] = [
  { title: "Your library", to: "/app/library", icon: box },
]

export const campaignSettingsNav: NavItem[] = [
  { title: "Campaign settings", to: "/app/campaign-settings", icon: settings },
]

export const navItems = [...campaignNav, ...libraryNav, ...campaignSettingsNav]
