import type { CampaignTemplate } from "./campaign-template-types"
import { GOBLIN_ARROWS_TEST } from "./goblin-arrows-test"
import { STARTER_VILLAGE } from "./starter-village"
import { countPages } from "./template-pages"
import { WORLD_KINDS, worldKinds } from "./world-kinds"
import type { WorldEntryKind } from "./world-kinds"

// More templates are one more entry here.
export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [STARTER_VILLAGE, GOBLIN_ARROWS_TEST]

// The kinds a template contains, in the registry's order.
export function templateKinds(template: CampaignTemplate): WorldEntryKind[] {
  return worldKinds.filter((kind) => template.entries.some((entry) => entry.kind === kind))
}

// "13 entries · NPCs, creatures, locations"
export function summarize(template: CampaignTemplate) {
  const kinds = templateKinds(template).map((kind) => WORLD_KINDS[kind].nouns)
  const pages = template.journalPages ? ` · ${countPages(template.journalPages)} journal pages` : ""
  return `${template.entries.length} entries · ${kinds.join(", ")}${pages}`
}

// "13 entries · 4 NPCs · 3 locations", counted from the entries themselves.
export function countSummary(template: CampaignTemplate) {
  const counts = templateKinds(template).map((kind) => {
    const count = template.entries.filter((entry) => entry.kind === kind).length
    return `${count} ${count === 1 ? WORLD_KINDS[kind].label : WORLD_KINDS[kind].nouns}`
  })
  return [`${template.entries.length} entries`, ...counts].join(" · ")
}

// What a blank campaign is, in a line.
export const BLANK_DESCRIPTION = "Start empty and build your world as you go."
