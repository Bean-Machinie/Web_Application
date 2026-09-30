import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"

const tabs = [
  { label: "Profile", to: "/app/settings/profile" },
  { label: "Password", to: "/app/settings/password" },
  { label: "Appearance", to: "/app/settings/appearance" },
  { label: "Notifications", to: "/app/settings/notifications" },
  { label: "Billing", to: "/app/settings/billing" },
]

export function SettingsTabs() {
  return (
    <nav
      aria-label="Settings"
      className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto border-b px-4 md:mx-0 md:px-0"
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            cn(
              "focus-visible:ring-ring -mb-px shrink-0 rounded-t-md border-b-2 px-3 pt-1 pb-3 text-sm font-medium transition-colors outline-none focus-visible:ring-2",
              isActive
                ? "border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground border-transparent"
            )
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
