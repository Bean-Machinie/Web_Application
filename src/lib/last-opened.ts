import type { Campaign } from "./campaigns"
import type { Recent } from "./palette-items"

// The campaigns opened most recently, newest first, that you still belong to. When fewer than
// `limit` were opened lately, the rest are filled from the others in their own order. Empty when
// none was ever opened, which is how Home knows you have not been here before.
export function recentCampaigns(recents: Recent[], campaigns: Campaign[], limit: number) {
  const opened: Campaign[] = []
  for (const recent of recents) {
    const found = campaigns.find((campaign) => recent.key === `campaign:${campaign.id}`)
    if (found && !opened.includes(found)) opened.push(found)
  }
  if (opened.length === 0) return []
  return [...opened, ...campaigns.filter((campaign) => !opened.includes(campaign))].slice(0, limit)
}

// When a campaign was last opened in this browser, in milliseconds, or null if that was not kept.
export const openedAt = (recents: Recent[], campaignId: string) => recents.find((recent) => recent.key === `campaign:${campaignId}`)?.at ?? null
