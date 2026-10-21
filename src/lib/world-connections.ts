import { supabase } from "@/lib/supabase"
import { toWorldImage } from "./world-images"
import { COVER_FIELD } from "./world-kinds"
import type { WorldEntryKind } from "./world-kinds"

// One row of world_entry_links: a pin or a mention from one entry to another.
export type EntryLink = {
  type: "pin" | "mention"
  sourceId: string
  targetId: string
  // For a mention, the field it is in.
  fieldKey: string | null
  // For a pin, which one and where it is, as a share of the map.
  markerId: string | null
  x: number | null
  y: number | null
}

// What a row needs about the entry on the other end.
export type LinkedEntry = {
  id: string
  kind: WorldEntryKind
  name: string
  revealed: boolean
  imageUrl: string | null
}

type LinkRow = {
  link_type: EntryLink["type"]
  source_id: string
  target_id: string
  field_key: string | null
  marker_id: string | null
  x: number | null
  y: number | null
}

type EntryRow = {
  id: string
  kind: WorldEntryKind
  name: string
  revealed: boolean
  world_entry_fields: { key: string; value: unknown }[]
}

// Every link to or from the entry, and the entries on the other ends. The view
// applies the read rules of both tables, so a player only gets what they may
// see; nothing is filtered again here.
export async function fetchConnections(entryId: string) {
  const { data, error } = await supabase
    .from("world_entry_links")
    .select("link_type, source_id, target_id, field_key, marker_id, x, y")
    .or(`source_id.eq.${entryId},target_id.eq.${entryId}`)
  if (error) throw error

  const links = (data as LinkRow[]).map(
    (row): EntryLink => ({
      type: row.link_type,
      sourceId: row.source_id,
      targetId: row.target_id,
      fieldKey: row.field_key,
      markerId: row.marker_id,
      x: row.x,
      y: row.y,
    })
  )

  const others = [
    ...new Set(links.map((link) => (link.sourceId === entryId ? link.targetId : link.sourceId))),
  ]
  const entries = new Map<string, LinkedEntry>()
  if (others.length === 0) return { links, entries }

  // The foreign key is named: the mentions table is a second way from an entry
  // to a field.
  const found = await supabase
    .from("world_entries")
    .select("id, kind, name, revealed, world_entry_fields!entry_id(key, value)")
    .in("id", others)
    .eq("world_entry_fields.key", COVER_FIELD)
  if (found.error) throw found.error

  for (const row of found.data as unknown as EntryRow[]) {
    entries.set(row.id, {
      id: row.id,
      kind: row.kind,
      name: row.name,
      revealed: row.revealed,
      imageUrl: toWorldImage(row.world_entry_fields[0]?.value)?.url ?? null,
    })
  }
  return { links, entries }
}
