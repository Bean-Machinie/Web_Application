import { NavLink } from "react-router-dom"
import { ChevronLeft } from "lucide-react"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import type { Campaign } from "@/lib/campaigns"
import { CampaignAvatar } from "./CampaignAvatar"

// The top of the sidebar inside a campaign: the way back, and which campaign this is.
export function CampaignSidebarHeader({ campaign }: { campaign: Campaign | null }) {
  const { isMobile, setOpenMobile } = useSidebar()

  return (
    <SidebarGroup className="px-2">
      <SidebarMenu className="gap-1">
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            tooltip="Campaigns"
            className="text-muted-foreground h-9 pl-[15px] text-[13.5px] group-data-[collapsible=icon]:size-12! group-data-[collapsible=icon]:px-[15px]!"
          >
            <NavLink to="/app" onClick={() => isMobile && setOpenMobile(false)}>
              <ChevronLeft className="size-[18px]" />
              <span>Campaigns</span>
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
        {campaign && (
          <SidebarMenuItem>
            <div className="flex h-12 items-center gap-2 pr-3 pl-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <CampaignAvatar
                name={campaign.name}
                imageUrl={campaign.imageUrl}
                className="size-8 shrink-0"
              />
              <span className="truncate text-[14.5px] font-medium group-data-[collapsible=icon]:hidden">
                {campaign.name}
              </span>
            </div>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
