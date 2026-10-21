import { supabase } from "./supabase"
import type { WorldEntryKind } from "./world-kinds"

// One entry a copy of some maps reaches, as plan_map_copy reports it.
export type PlanRow = {
  sourceId: string
  name: string
  kind: WorldEntryKind
  // A map that was asked for, as opposed to something its pins link.
  isRoot: boolean
  // The copy already in the target, if there is one; the pin links to it.
  existingId: string | null
  imagePath: string | null
  pinCount: number
}

type Row = {
  source_id: string
  name: string
  kind: WorldEntryKind
  is_root: boolean
  existing_id: string | null
  image_path: string | null
  pin_count: number
}

// targetCampaign null is the person's library.
export async function fetchCopyPlan(mapIds: string[], targetCampaign: string | null) {
  const { data, error } = await supabase.rpc("plan_map_copy", {
    source_maps: mapIds,
    target_campaign: targetCampaign,
  })
  if (error) throw error

  return (data as Row[]).map(
    (row): PlanRow => ({
      sourceId: row.source_id,
      name: row.name,
      kind: row.kind,
      isRoot: row.is_root,
      existingId: row.existing_id,
      imagePath: row.image_path,
      pinCount: row.pin_count,
    })
  )
}

// What the dialog says: the linked entries that would be copied, and the ones
// the target already has a copy of.
export function summarizePlan(rows: PlanRow[]) {
  const linked = rows.filter((row) => !row.isRoot)
  return {
    linked,
    fresh: linked.filter((row) => !row.existingId).length,
    present: linked.filter((row) => row.existingId).length,
    maps: rows.filter((row) => row.isRoot && row.pinCount > 0).length,
  }
}
