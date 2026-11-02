import { useState } from "react"
import { templateKinds } from "@/lib/campaign-templates"
import type { CampaignTemplate } from "@/lib/campaign-template-types"
import { TemplateKindFilter } from "./TemplateKindFilter"
import type { KindFilter } from "./TemplateKindFilter"
import { TemplateRing } from "./TemplateRing"

// What the starter holds: chips to pick a kind, and the entries on a ring to turn through.
export function TemplateContents({ template }: { template: CampaignTemplate }) {
  const [filter, setFilter] = useState<KindFilter>("all")
  // In the registry's order of kinds, so like entries sit together.
  const entries = templateKinds(template)
    .filter((kind) => filter === "all" || kind === filter)
    .flatMap((kind) => template.entries.filter((entry) => entry.kind === kind))

  return (
    <>
      <TemplateKindFilter template={template} value={filter} onChange={setFilter} />
      {/* Keyed by the filter, so each choice swings its own ring into place. */}
      <TemplateRing key={filter} template={template} entries={entries} />
    </>
  )
}
