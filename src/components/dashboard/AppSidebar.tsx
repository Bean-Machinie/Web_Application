import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { navGroups } from "./nav-items"
import { NavMain } from "./NavMain"
import { NavUser } from "./NavUser"
import { SidebarBrand } from "./SidebarBrand"

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-3">
        <SidebarBrand />
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <NavMain key={group.label} group={group} />
        ))}
      </SidebarContent>

      <SidebarFooter className="px-4">
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
