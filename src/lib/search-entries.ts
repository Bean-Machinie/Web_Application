import { supabase } from "@/lib/supabase"
import type { WorldEntryKind } from "./world-kinds"

export type SearchSource = "current" | "other" | "library"

// One entry the database found by name.
export type SearchHit = {
  id: string
  // Null for a library entry.
  campaignId: string | null
  campaignName: string | null
  kind: WorldEntryKind
  name: string
  source: SearchSource
}

// Typo-tolerant, across every campaign the person is in and their library. The
// database decides what each person may find; see search_world_entries.
export async function searchEntries(
  text: string,
  currentCampaign: string | null,
  sources: SearchSource[],
  perGroup: number
): Promise<SearchHit[]> {
  const { data, error } = await supabase.rpc("search_world_entries", {
    search_text: text,
    current_campaign: currentCampaign,
    per_group: perGroup,
    sources,
  })
  if (error) throw error

  return (data as Record<string, unknown>[]).map((row) => ({
    id: row.id as string,
    campaignId: row.campaign_id as string | null,
    campaignName: row.campaign_name as string | null,
    kind: row.kind as WorldEntryKind,
    name: row.name as string,
    source: row.source as SearchSource,
  }))
}
