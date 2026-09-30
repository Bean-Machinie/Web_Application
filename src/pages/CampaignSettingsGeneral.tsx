import { CampaignGeneralForm } from "@/components/dashboard/CampaignGeneralForm"
import { CampaignGeneralView } from "@/components/dashboard/CampaignGeneralView"
import { useCampaign } from "@/components/dashboard/useCampaign"

export function CampaignSettingsGeneral() {
  const { current, can } = useCampaign()
  if (!current) return null

  return can("manage") ? (
    <CampaignGeneralForm key={current.id} campaign={current} />
  ) : (
    <CampaignGeneralView campaign={current} />
  )
}
