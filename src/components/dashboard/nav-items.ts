import desktop from "@/assets/icons/desktop.svg"
import graph from "@/assets/icons/graph.svg"
import box from "@/assets/icons/box.svg"
import userGroup from "@/assets/icons/user-group.svg"

export type NavItem = {
  title: string
  to: string
  icon: string
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
      { title: "Overview", to: "/app", icon: desktop },
      { title: "Analytics", to: "/app/analytics", icon: graph },
      { title: "Projects", to: "/app/projects", icon: box, badge: "4" },
      { title: "Team", to: "/app/team", icon: userGroup },
    ],
  },
]

export const navItems = navGroups.flatMap((group) => group.items)
