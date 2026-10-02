import type { CampaignTemplate } from "./campaign-template-types"
import { STARTER_VILLAGE } from "./starter-village"
import { WORLD_KINDS, worldKinds } from "./world-kinds"
import type { WorldEntryKind } from "./world-kinds"

// More templates are one more entry here.
export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [STARTER_VILLAGE]

// The kinds a template contains, in the registry's order.
export function templateKinds(template: CampaignTemplate): WorldEntryKind[] {
  return worldKinds.filter((kind) => template.entries.some((entry) => entry.kind === kind))
}

// "13 entries · characters, creatures, locations"
export function summarize(template: CampaignTemplate) {
  const kinds = templateKinds(template).map((kind) => WORLD_KINDS[kind].plural.toLowerCase())
  return `${template.entries.length} entries · ${kinds.join(", ")}`
}
