import { useState } from "react"
import { Outlet } from "react-router-dom"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { readSidebarState } from "@/lib/sidebar-state"
import { AppSidebar } from "./AppSidebar"
import { BreadcrumbProvider } from "./BreadcrumbProvider"
import { CommandPaletteProvider } from "./CommandPaletteProvider"
import { DashboardHeader } from "./DashboardHeader"
import { DitherBackground } from "./DitherBackground"
import { PlainBackgroundContext } from "./plain-background"
import { useBackground } from "@/theme/useBackground"
import { useScopeId } from "@/hooks/use-scope-id"

export function DashboardLayout() {
  const [plain, setPlain] = useState(false)
  const { background } = useBackground()
  const campaignId = useScopeId()

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
        <SidebarInset className="dither-surface min-w-0">
          {!plain && background !== "off" && <DitherBackground still={background === "still"} />}
          <PlainBackgroundContext.Provider value={setPlain}>
            <BreadcrumbProvider>
              <DashboardHeader />
              {/* Positioned, so that it paints over the background, which comes first. */}
              {/* Keyed by campaign, so crossing into or out of one plays the entrance. */}
              <div key={campaignId ?? "home"} className="scope-enter relative flex min-w-0 flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                <Outlet />
              </div>
            </BreadcrumbProvider>
          </PlainBackgroundContext.Provider>
        </SidebarInset>
      </CommandPaletteProvider>
    </SidebarProvider>
  )
}
