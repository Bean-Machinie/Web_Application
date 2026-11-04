import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { GuestRedirect } from "@/components/auth/GuestRedirect"
import { useAccountDialog } from "@/components/auth/useAccountDialog"
import { CampaignNameStep } from "@/components/dashboard/CampaignNameStep"
import { TemplateGallery } from "@/components/dashboard/TemplateGallery"
import { useCampaign } from "@/components/dashboard/useCampaign"
import { defaultCoverById, randomCover, renderCoverFile } from "@/lib/campaign-covers"
import type { CoverChoice } from "@/lib/campaign-covers"
import { saveCampaignImage } from "@/lib/campaign-image"
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
  // Chosen once, so the blank card and the page after it show the same cover.
  const [blankCover] = useState(randomCover)

  async function handleCreate(name: string, cover: CoverChoice) {
    const entries = template ? await entriesWithPortraits(template) : []
    const campaign = await createCampaign(name, entries, template?.journalPages)
    try {
      const file = cover.kind === "upload" ? cover.file : await renderCoverFile(defaultCoverById(cover.id))
      await saveCampaignImage(campaign, { file, remove: false })
    } catch {
      // The campaign exists by now; without a cover it shows its emblem, and one can be added in the settings.
    }
    await refresh()
    navigate(campaignPath(campaign.id, "world"))
  }

  if (isGuest) return <GuestRedirect action="create a campaign" />

  if (template === undefined) {
    return <TemplateGallery onChoose={setTemplate} blankCover={blankCover} backTo="/app/campaigns" />
  }

  return (
    <CampaignNameStep
      template={template}
      initialCover={template ? { kind: "default", id: template.cover } : blankCover}
      onCreate={handleCreate}
      onBack={() => setTemplate(undefined)}
    />
  )
}
