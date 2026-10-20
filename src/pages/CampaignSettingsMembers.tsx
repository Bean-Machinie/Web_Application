import { CampaignMembers } from "@/components/dashboard/CampaignMembers"
import { useCurrentCampaign } from "@/components/dashboard/useCurrentCampaign"

export function CampaignSettingsMembers() {
  const { current } = useCurrentCampaign()

  return <CampaignMembers key={current.id} campaign={current} />
}
