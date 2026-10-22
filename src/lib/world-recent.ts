import { supabase } from "./supabase"
import { toEntry } from "./world-entries"
import type { WorldEntry } from "./world-entries"
import { COVER_FIELD } from "./world-kinds"

export type RecentBy = "updated" | "created"

// An entry and where it lives: a campaign, or null for the library.
export type RecentEntry = { entry: WorldEntry; campaignId: string | null }

const COLUMNS = "id, kind, name, revealed, sort_order, created_at, updated_at, campaign_id"

// The newest entries across the person's library and the campaigns whose world they
// run, by when they were changed or made. Security already limits what is read to
// that, so this only has to say which campaigns to look in.
export async function fetchRecentEntries(campaignIds: string[], by: RecentBy, limit: number) {
  const inCampaigns = campaignIds.length > 0 ? `,campaign_id.in.(${campaignIds.join(",")})` : ""
  const { data, error } = await supabase
    .from("world_entries")
    .select(`${COLUMNS}, world_entry_fields!entry_id(key, value)`)
    .in("world_entry_fields.key", [COVER_FIELD])
    .or(`campaign_id.is.null${inCampaigns}`)
    .order(by === "updated" ? "updated_at" : "created_at", { ascending: false })
    .limit(limit)
  if (error) throw error

  return (data as Record<string, unknown>[]).map(
    (row): RecentEntry => ({ entry: toEntry(row), campaignId: row.campaign_id as string | null })
  )
}
