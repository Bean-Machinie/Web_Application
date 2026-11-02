import { Link } from "react-router-dom"
import type { CoverChoice } from "@/lib/campaign-covers"
import { BLANK_DESCRIPTION, CAMPAIGN_TEMPLATES, summarize } from "@/lib/campaign-templates"
import type { CampaignTemplate } from "@/lib/campaign-template-types"
import { TemplateCard } from "./TemplateCard"
import { CoverImage } from "./CoverImage"

type Props = {
  // Null starts a blank campaign.
  onChoose: (template: CampaignTemplate | null) => void
  // The cover a blank campaign will start with.
  blankCover: CoverChoice
  backTo: string
}

// Step 1: how do you want to start?
export function TemplateGallery({ onChoose, blankCover, backTo }: Props) {
  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-6 pt-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-xl font-semibold tracking-tight">How do you want to start?</h1>
        <p className="text-muted-foreground text-sm">
          You will be the GM and can invite players afterwards.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {CAMPAIGN_TEMPLATES.map((template) => (
          <TemplateCard
            key={template.id}
            title={template.name}
            summary={summarize(template)}
            description={template.description}
            cover={<CoverImage cover={{ kind: "default", id: template.cover }} />}
            onSelect={() => onChoose(template)}
          />
        ))}
        <TemplateCard
          title="Blank campaign"
          description={BLANK_DESCRIPTION}
          cover={<CoverImage cover={blankCover} />}
          onSelect={() => onChoose(null)}
        />
      </div>
      <Link
        to={backTo}
        className="text-muted-foreground hover:text-foreground text-center text-sm underline-offset-4 hover:underline"
      >
        Back
      </Link>
    </section>
  )
}
