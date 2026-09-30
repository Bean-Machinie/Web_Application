import { Outlet } from "react-router-dom"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { readSidebarState } from "@/lib/sidebar-state"
import { AppSidebar } from "./AppSidebar"
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
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
