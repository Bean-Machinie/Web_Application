import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { GuestRedirect } from "@/components/auth/GuestRedirect"
import { useAccountDialog } from "@/components/auth/useAccountDialog"
import { CampaignNameStep } from "@/components/dashboard/CampaignNameStep"
import { TemplateGallery } from "@/components/dashboard/TemplateGallery"
import { useCampaign } from "@/components/dashboard/useCampaign"
import type { CampaignTemplate } from "@/lib/campaign-template-types"
import { campaignPath } from "@/lib/campaign-paths"
import { createCampaign } from "@/lib/campaigns"
import { entriesWithPortraits } from "@/lib/template-portraits"

export function NewCampaign() {
  const navigate = useNavigate()
  const { refresh } = useCampaign()
  const { isGuest } = useAccountDialog()
  // Undefined is step 1; null is the blank campaign.
  const [template, setTemplate] = useState<CampaignTemplate | null | undefined>(undefined)

  async function handleCreate(name: string) {
    const entries = template ? await entriesWithPortraits(template) : []
    const campaign = await createCampaign(name, entries)
    await refresh()
    navigate(campaignPath(campaign.id, "world"))
  }

  if (isGuest) return <GuestRedirect action="create a campaign" />

  if (template === undefined) {
    return (
      <TemplateGallery onChoose={setTemplate} backTo="/app/campaigns" />
    )
  }

  return (
    <CampaignNameStep
      template={template}
      onCreate={handleCreate}
      onBack={() => setTemplate(undefined)}
    />
  )
}
