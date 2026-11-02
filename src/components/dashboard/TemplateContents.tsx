import { countSummary, templateKinds } from "@/lib/campaign-templates"
import type { CampaignTemplate } from "@/lib/campaign-template-types"
import { TemplateRing } from "./TemplateRing"

// "What's inside": the starter's entries on a ring to turn through, each with a peek at it.
export function TemplateContents({ template }: { template: CampaignTemplate }) {
  // In the registry's order of kinds, so like entries sit together.
  const entries = templateKinds(template).flatMap((kind) =>
    template.entries.filter((entry) => entry.kind === kind)
  )

  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-lg font-semibold">What&apos;s inside</h2>
        <p className="text-muted-foreground text-sm">{countSummary(template)}</p>
      </div>
      <TemplateRing template={template} entries={entries} />
    </section>
  )
}
