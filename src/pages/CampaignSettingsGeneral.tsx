import { CampaignGeneralForm } from "@/components/dashboard/CampaignGeneralForm"
import { CampaignGeneralView } from "@/components/dashboard/CampaignGeneralView"
import { useCurrentCampaign } from "@/components/dashboard/useCurrentCampaign"

export function CampaignSettingsGeneral() {
  const { current, can } = useCurrentCampaign()

  return can("manage") ? (
    <CampaignGeneralForm key={current.id} campaign={current} />
  ) : (
    <CampaignGeneralView campaign={current} />
  )
}
