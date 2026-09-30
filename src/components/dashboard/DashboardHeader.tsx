import { useLocation } from "react-router-dom"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/theme/ThemeToggle"
import { navItems } from "./nav-items"

// Pages reached from the account menu rather than the sidebar.
const menuPages = [
  { title: "Settings", to: "/app/settings" },
  { title: "Support", to: "/app/support" },
  { title: "New campaign", to: "/app/campaigns/new" },
  { title: "Join with invite link", to: "/app/campaigns/join" },
]

function useCurrentTitle() {
  const { pathname } = useLocation()
  const match = [...navItems, ...menuPages].find(
    (item) => item.to !== "/app" && pathname.startsWith(item.to)
  )

  return match?.title ?? "Overview"
}

export function DashboardHeader() {
  const title = useCurrentTitle()

  return (
    <header className="bg-background/80 sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b backdrop-blur-sm transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-2 px-4">
        {/* On desktop the sidebar's brand button toggles it; this is for the mobile drawer. */}
        <SidebarTrigger className="-ml-1 md:hidden" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4 md:hidden"
        />
        <h1 className="text-[17px] font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
