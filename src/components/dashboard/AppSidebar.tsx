import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { CampaignSwitcher } from "./CampaignSwitcher"
import { campaignNav, campaignSettingsNav, libraryNav } from "./nav-items"
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
        <CampaignSwitcher />
        <NavMain items={campaignNav} className="pt-0" />
        <SidebarSeparator className="mx-4 w-auto" />
        <NavMain items={libraryNav} />
        <NavMain items={campaignSettingsNav} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter className="px-1.5">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
