import { CampaignMembers } from "@/components/dashboard/CampaignMembers"
import { useCampaign } from "@/components/dashboard/useCampaign"

export function CampaignSettingsMembers() {
  const { current } = useCampaign()
  if (!current) return null

  return <CampaignMembers key={current.id} campaign={current} />
}
