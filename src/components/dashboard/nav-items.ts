import {
  BarChart3,
  FolderKanban,
  LayoutDashboard,
  LifeBuoy,
  Settings,
  Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type NavItem = {
  title: string
  to: string
  icon: LucideIcon
  badge?: string
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { title: "Overview", to: "/app", icon: LayoutDashboard },
      { title: "Analytics", to: "/app/analytics", icon: BarChart3 },
      { title: "Projects", to: "/app/projects", icon: FolderKanban, badge: "4" },
      { title: "Team", to: "/app/team", icon: Users },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Settings", to: "/app/settings", icon: Settings },
      { title: "Support", to: "/app/support", icon: LifeBuoy },
    ],
  },
]

export const navItems = navGroups.flatMap((group) => group.items)
