import { useMatch } from "react-router-dom"
import { AnimatePresence, motion } from "motion/react"
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
import { SidebarSearch } from "./SidebarSearch"
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
        {/* Both top rows are the same height, so they crossfade in place. */}
        <div className="relative shrink-0">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={inCampaign ? "campaign" : "home"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {inCampaign ? <CampaignSidebarHeader campaign={campaign} /> : <SidebarSearch />}
            </motion.div>
          </AnimatePresence>
        </div>
        {inCampaign ? (
          campaign && (
            <>
              <NavMain items={campaignNav(campaign.id)} className="pt-0" />
              <NavMain items={campaignSettingsNav(campaign.id)} className="mt-auto" />
            </>
          )
        ) : (
          <NavMain items={homeNav} className="pt-0" />
        )}
      </SidebarContent>

      <SidebarFooter className="px-1.5">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
