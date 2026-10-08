import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { NotificationBell } from "./NotificationBell"
import { PageBreadcrumbs } from "./PageBreadcrumbs"

export function DashboardHeader() {
  return (
    <header className="bg-background/80 sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b backdrop-blur-sm transition-[width,height] ease-linear">
      <div className="flex w-full min-w-0 items-center gap-2 px-4">
        {/* On desktop the sidebar's brand button toggles it; this is for the mobile drawer. */}
        <SidebarTrigger className="-ml-1 md:hidden" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4 md:hidden"
        />
        <PageBreadcrumbs />
        <div className="ml-auto flex items-center gap-2">
          <NotificationBell />
        </div>
      </div>
    </header>
  )
}
