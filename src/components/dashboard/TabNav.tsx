import type { ReactNode } from "react"
import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"

type Props = {
  label: string
  tabs: { label: string; to: string; badge?: ReactNode }[]
}

export function TabNav({ label, tabs }: Props) {
  return (
    <nav
      aria-label={label}
      className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto border-b px-4 md:mx-0 md:px-0"
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            cn(
              "focus-visible:ring-ring -mb-px flex shrink-0 items-center gap-2 rounded-t-md border-b-2 px-3 pt-1 pb-3 text-sm font-medium transition-colors outline-none focus-visible:ring-2",
              isActive
                ? "border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground border-transparent"
            )
          }
        >
          {tab.label}
          {tab.badge}
        </NavLink>
      ))}
    </nav>
  )
}
