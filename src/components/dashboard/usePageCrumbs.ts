import { useContext } from "react"
import { useLocation, useMatch } from "react-router-dom"
import type { Crumb } from "@/lib/breadcrumbs"
import { campaignPath } from "@/lib/campaign-paths"
import { BreadcrumbContext } from "./BreadcrumbContext"
import { campaignNav, campaignSettingsNav } from "./nav-items"
import { useRouteCampaign } from "./useCurrentCampaign"

const campaigns: Crumb = { label: "Campaigns", to: "/app" }

// Pages outside a campaign that are not the campaigns home.
const userPages = [
  { title: "Support", to: "/app/support" },
  { title: "Your library", to: "/app/library" },
  { title: "New campaign", to: "/app/campaigns/new" },
]

function campaignPageTitle(campaignId: string, pathname: string) {
  const items = [...campaignNav(campaignId), ...campaignSettingsNav(campaignId)]
  const match = items.find((item) =>
    item.exact ? pathname === item.to : pathname.startsWith(item.to)
  )

  return match?.title ?? "Overview"
}

// The trail in the app header: Campaigns / Tessa's Tale / World. A page that
// sets its own trail replaces the last step, so the campaign steps always come first.
export function usePageCrumbs(): Crumb[] {
  const { pathname } = useLocation()
  const { trail } = useContext(BreadcrumbContext)
  const campaign = useRouteCampaign()
  const inCampaign = useMatch("/app/c/:campaignId/*") !== null

  if (inCampaign) {
    if (!campaign) return [{ label: "Campaigns" }]
    const title = campaignPageTitle(campaign.id, pathname)
    const here = { label: campaign.name, to: campaignPath(campaign.id) }
    return [campaigns, here, ...(trail ?? [{ label: title }])]
  }

  const page = userPages.find((item) => pathname.startsWith(item.to))
  if (trail) return trail
  if (!page) return [{ label: "Campaigns" }]

  // New campaign is reached from the campaigns home.
  return page.to === "/app/campaigns/new" ? [campaigns, { label: page.title }] : [{ label: page.title }]
}
