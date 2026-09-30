import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { navGroups } from "./nav-items"
import { NavMain } from "./NavMain"
import { NavUser } from "./NavUser"
import { SidebarBrand } from "./SidebarBrand"

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-1.5 py-2">
        <SidebarBrand />
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <NavMain key={group.label} group={group} />
        ))}
      </SidebarContent>

      <SidebarFooter className="px-1.5">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
