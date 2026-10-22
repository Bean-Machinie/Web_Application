import { useContext } from "react"
import { useLocation, useMatch } from "react-router-dom"
import type { Crumb } from "@/lib/breadcrumbs"
import { BreadcrumbContext } from "./BreadcrumbContext"
import { campaignNav, campaignSettingsNav } from "./nav-items"
import { useRouteCampaign } from "./useCurrentCampaign"

// Pages outside a campaign that are not the campaigns home.
const userPages = [
  { title: "Support", to: "/app/support" },
  { title: "Your library", to: "/app/library" },
  { title: "New campaign", to: "/app/campaigns/new" },
  { title: "Join campaign", to: "/app/campaigns/join" },
]

// A page the sidebar does not list is named after its own route.
function campaignPageTitle(campaignId: string, pathname: string) {
  const items = [...campaignNav(campaignId), ...campaignSettingsNav(campaignId)]
  const match = items.find((item) =>
    item.exact ? pathname === item.to : pathname.startsWith(item.to)
  )
  if (match) return match.title

  const segment = pathname.split("/").filter(Boolean).pop() ?? "Overview"
  const words = segment.replace(/-/g, " ")
  return words.charAt(0).toUpperCase() + words.slice(1)
}

// The trail in the app header. It only shows what the rest of the screen does
// not: inside a campaign the sidebar already names the campaign, so the trail
// starts at the section, such as World / Wolf. A page that sets its own trail
// gives the whole of it; nothing is added in front.
export function usePageCrumbs(): Crumb[] {
  const { pathname } = useLocation()
  const { trail } = useContext(BreadcrumbContext)
  const campaign = useRouteCampaign()
  const inCampaign = useMatch("/app/c/:campaignId/*") !== null

  if (trail) return trail
  if (inCampaign) {
    return [{ label: campaign ? campaignPageTitle(campaign.id, pathname) : "Home" }]
  }

  const page = userPages.find((item) => pathname.startsWith(item.to))
  return [{ label: page?.title ?? "Home" }]
}
