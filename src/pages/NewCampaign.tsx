import { useState } from "react"
import { useNavigate } from "react-router-dom"
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
  // Undefined is step 1; null is the blank campaign.
  const [template, setTemplate] = useState<CampaignTemplate | null | undefined>(undefined)

  async function handleCreate(name: string) {
    const entries = template ? await entriesWithPortraits(template) : []
    const campaign = await createCampaign(name, entries)
    await refresh()
    navigate(campaignPath(campaign.id, "world"))
  }

  if (template === undefined) {
    return (
      <TemplateGallery onChoose={setTemplate} backTo="/app" />
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
