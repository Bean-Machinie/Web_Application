import { TabNav } from "./TabNav"
import { useCampaign } from "./useCampaign"

export function CampaignSettingsTabs() {
  const { can } = useCampaign()
  const base = "/app/campaign-settings"

  const tabs = [
    { label: "General", to: `${base}/general` },
    { label: "Members", to: `${base}/members` },
    ...(can("manage") ? [{ label: "Advanced", to: `${base}/advanced` }] : []),
  ]

  return <TabNav label="Campaign settings" tabs={tabs} />
}
