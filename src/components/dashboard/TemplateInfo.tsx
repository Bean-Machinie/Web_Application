import type { CampaignTemplate } from "@/lib/campaign-template-types"
import { HelpHint } from "./HelpHint"

// The "i" beside the title: what the starter is, and who made it.
export function TemplateInfo({ template }: { template: CampaignTemplate }) {
  return (
    <HelpHint
      label="About this template"
      title={template.name}
      summary={template.description}
      note={template.credits}
    />
  )
}
