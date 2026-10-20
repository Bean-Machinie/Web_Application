import { TabNav } from "./TabNav"
import { campaignPath } from "@/lib/campaign-paths"
import { useCurrentCampaign } from "./useCurrentCampaign"

export function CampaignSettingsTabs() {
  const { current, can } = useCurrentCampaign()
  const base = campaignPath(current.id, "campaign-settings")

  const tabs = [
    { label: "General", to: `${base}/general` },
    { label: "Members", to: `${base}/members` },
    ...(can("manage") ? [{ label: "Advanced", to: `${base}/advanced` }] : []),
  ]

  return <TabNav label="Campaign settings" tabs={tabs} />
}
