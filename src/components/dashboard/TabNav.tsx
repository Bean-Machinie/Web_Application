import type { ReactNode } from "react"
import { Link, NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"

type Props = {
  label: string
  // `isActive` is for tabs that differ only by query string, which NavLink
  // cannot tell apart. Leave it out and the route decides.
  tabs: { label: string; to: string; badge?: ReactNode; isActive?: boolean }[]
}

function tabClass(active: boolean) {
  return cn(
    "focus-visible:ring-ring -mb-px flex shrink-0 items-center gap-2 rounded-t-md border-b-2 px-3 pt-1 pb-3 text-sm font-medium transition-colors outline-none focus-visible:ring-2",
    active
      ? "border-primary text-foreground"
      : "text-muted-foreground hover:text-foreground border-transparent"
  )
}

export function TabNav({ label, tabs }: Props) {
  return (
    <nav
      aria-label={label}
      className="no-scrollbar -mx-4 flex touch-pan-x gap-1 overflow-x-auto border-b px-4 md:mx-0 md:px-0"
    >
      {tabs.map((tab) => {
        const content = (
          <>
            {tab.label}
            {tab.badge}
          </>
        )

        if (tab.isActive === undefined) {
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) => tabClass(isActive)}
            >
              {content}
            </NavLink>
          )
        }

        return (
          <Link
            key={tab.to}
            to={tab.to}
            aria-current={tab.isActive ? "page" : undefined}
            className={tabClass(tab.isActive)}
          >
            {content}
          </Link>
        )
      })}
    </nav>
  )
}
