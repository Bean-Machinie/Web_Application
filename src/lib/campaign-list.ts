import type { Campaign } from "./campaigns"
import type { CampaignRole } from "./campaign-permissions"

export type RoleFilter = "all" | CampaignRole
export type SortKey = "name" | "created"
export type Sort = { by: SortKey; dir: "asc" | "desc" }

export const roleLabel = (role: CampaignRole) =>
  role === "gm" ? "Game master" : "Player"

// Names read A to Z, dates newest first.
export const defaultSort = (by: SortKey): Sort => ({
  by,
  dir: by === "name" ? "asc" : "desc",
})

const COMPARE: Record<SortKey, (a: Campaign, b: Campaign) => number> = {
  name: (a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }),
  created: (a, b) => a.createdAt.localeCompare(b.createdAt),
}

export function viewCampaigns(
  campaigns: Campaign[],
  view: { query: string; role: RoleFilter; sort: Sort }
) {
  const query = view.query.trim().toLowerCase()
  const sign = view.sort.dir === "asc" ? 1 : -1

  return campaigns
    .filter(
      (campaign) =>
        (view.role === "all" || campaign.role === view.role) &&
        campaign.name.toLowerCase().includes(query)
    )
    .sort((a, b) => sign * COMPARE[view.sort.by](a, b))
}
