import { useMatch } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { CampaignSidebarHeader } from "./CampaignSidebarHeader"
import { campaignNav, campaignSettingsNav, homeNav } from "./nav-items"
import { NavMain } from "./NavMain"
import { NavUser } from "./NavUser"
import { SidebarBrand } from "./SidebarBrand"
import { useRouteCampaign } from "./useCurrentCampaign"

// Two modes: the home pages show Campaigns and the library; inside a campaign
// the sidebar is about that campaign alone.
export function AppSidebar() {
  const inCampaign = useMatch("/app/c/:campaignId/*") !== null
  const campaign = useRouteCampaign()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-1.5 py-2">
        <SidebarBrand />
      </SidebarHeader>

      <SidebarContent>
        {inCampaign ? (
          <>
            <CampaignSidebarHeader campaign={campaign} />
            {campaign && (
              <>
                <NavMain items={campaignNav(campaign.id)} className="pt-0" />
                <NavMain
                  items={campaignSettingsNav(campaign.id)}
                  className="mt-auto"
                />
              </>
            )}
          </>
        ) : (
          <NavMain items={homeNav} />
        )}
      </SidebarContent>

      <SidebarFooter className="px-1.5">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
