import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { CampaignNameStep } from "@/components/dashboard/CampaignNameStep"
import { TemplateGallery } from "@/components/dashboard/TemplateGallery"
import { useCampaign } from "@/components/dashboard/useCampaign"
import type { CampaignTemplate } from "@/lib/campaign-template-types"
import { createCampaign } from "@/lib/campaigns"

export function NewCampaign() {
  const navigate = useNavigate()
  const { current, refresh, select } = useCampaign()
  // Undefined is step 1; null is the blank campaign.
  const [template, setTemplate] = useState<CampaignTemplate | null | undefined>(undefined)

  async function handleCreate(name: string) {
    const campaign = await createCampaign(name, template?.entries)
    await refresh()
    select(campaign.id)
    navigate("/app/world")
  }

  if (template === undefined) {
    return (
      <TemplateGallery
        onChoose={setTemplate}
        backTo={current ? "/app" : "/app/campaigns"}
      />
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
