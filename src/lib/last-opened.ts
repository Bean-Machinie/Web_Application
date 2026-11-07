import type { Campaign } from "./campaigns"
import type { Recent } from "./palette-items"

// The campaign opened most recently that you still belong to; null when there is none.
export function lastOpenedCampaign(recents: Recent[], campaigns: Campaign[]) {
  for (const recent of recents) {
    const found = campaigns.find((campaign) => recent.key === `campaign:${campaign.id}`)
    if (found) return found
  }
  return null
}
