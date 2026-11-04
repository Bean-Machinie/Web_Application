import { templateKinds } from "@/lib/campaign-templates"
import type { CampaignTemplate } from "@/lib/campaign-template-types"
import type { KindFilter } from "./TemplateKindFilter"
import { TemplateJournalPreview } from "./TemplateJournalPreview"
import { TemplateRing } from "./TemplateRing"

type Props = { template: CampaignTemplate; filter: KindFilter }

// The starter's entries of the chosen kind, on a ring to turn through.
export function TemplateContents({ template, filter }: Props) {
  if (filter === "journal" && template.journalPages) return <TemplateJournalPreview pages={template.journalPages} />

  // In the registry's order of kinds, so like entries sit together.
  const entries = templateKinds(template)
    .filter((kind) => filter === "all" || filter === "journal" || kind === filter)
    .flatMap((kind) => template.entries.filter((entry) => entry.kind === kind))

  // Keyed by the filter, so each choice swings its own ring into place.
  return <TemplateRing key={filter} template={template} entries={entries} />
}
