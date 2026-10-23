import { Outlet } from "react-router-dom"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { readSidebarState } from "@/lib/sidebar-state"
import { AppSidebar } from "./AppSidebar"
import { BreadcrumbProvider } from "./BreadcrumbProvider"
import { CommandPaletteProvider } from "./CommandPaletteProvider"
import { DashboardHeader } from "./DashboardHeader"

export function DashboardLayout() {
  return (
    <SidebarProvider
      defaultOpen={readSidebarState()}
      style={
        {
          "--sidebar-width": "18rem",
          "--sidebar-width-icon": "4rem",
        } as React.CSSProperties
      }
    >
      <CommandPaletteProvider>
        <AppSidebar />
        {/* min-w-0 all the way down: a flex child is never narrower than its content
            unless told so, and a graph canvas still at its old width would hold the
            page wider than the window after the sidebar opens. */}
        <SidebarInset className="min-w-0">
          <BreadcrumbProvider>
            <DashboardHeader />
            <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
              <Outlet />
            </div>
          </BreadcrumbProvider>
        </SidebarInset>
      </CommandPaletteProvider>
    </SidebarProvider>
  )
}
