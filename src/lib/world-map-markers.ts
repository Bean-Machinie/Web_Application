import { supabase } from "@/lib/supabase"
import { toWorldImage } from "./world-images"
import { COVER_FIELD } from "./world-kinds"
import type { WorldEntryKind } from "./world-kinds"

// A marker with what is needed to draw it. The database only sends markers
// whose map and linked entry the person may see.
export type MapMarker = {
  id: string
  x: number
  y: number
  entryId: string
  kind: WorldEntryKind
  name: string
  revealed: boolean
  imageUrl: string | null
}

type Row = {
  id: string
  x: number
  y: number
  entry_id: string
  entry: {
    kind: WorldEntryKind
    name: string
    revealed: boolean
    world_entry_fields: { key: string; value: unknown }[]
  }
}

export async function fetchMapMarkers(mapId: string) {
  const { data, error } = await supabase
    .from("world_map_markers")
    .select(
      "id, x, y, entry_id, entry:world_entries!entry_id(kind, name, revealed, world_entry_fields(key, value))"
    )
    .eq("map_id", mapId)
    .eq("entry.world_entry_fields.key", COVER_FIELD)
    .order("created_at", { ascending: true })
  if (error) throw error

  return (data as unknown as Row[]).map(
    (row): MapMarker => ({
      id: row.id,
      x: row.x,
      y: row.y,
      entryId: row.entry_id,
      kind: row.entry.kind,
      name: row.entry.name,
      revealed: row.entry.revealed,
      imageUrl: toWorldImage(row.entry.world_entry_fields[0]?.value)?.url ?? null,
    })
  )
}

export async function addMapMarker(mapId: string, entryId: string, x: number, y: number) {
  const { error } = await supabase.rpc("add_map_marker", {
    target_map: mapId,
    linked_entry: entryId,
    pos_x: x,
    pos_y: y,
  })
  if (error) throw error
}

export async function moveMapMarker(id: string, x: number, y: number) {
  const { error } = await supabase.rpc("move_map_marker", {
    target_marker: id,
    pos_x: x,
    pos_y: y,
  })
  if (error) throw error
}

export async function removeMapMarker(id: string) {
  const { error } = await supabase.rpc("remove_map_marker", { target_marker: id })
  if (error) throw error
}

// Where an entry stands on maps: one per marker, with what a preview needs.
// The same rules as above apply, so a player only gets revealed maps.
export type Placement = {
  id: string
  x: number
  y: number
  mapId: string
  mapName: string
  mapRevealed: boolean
  image: { url: string; width?: number; height?: number } | null
}

type PlacementRow = {
  id: string
  x: number
  y: number
  map: {
    id: string
    name: string
    revealed: boolean
    world_entry_fields: { key: string; value: unknown }[]
  }
}

export async function fetchPlacements(entryId: string) {
  const { data, error } = await supabase
    .from("world_map_markers")
    .select("id, x, y, map:world_entries!map_id(id, name, revealed, world_entry_fields(key, value))")
    .eq("entry_id", entryId)
    .eq("map.world_entry_fields.key", COVER_FIELD)
    .order("created_at", { ascending: true })
  if (error) throw error

  return (data as unknown as PlacementRow[]).map(
    (row): Placement => ({
      id: row.id,
      x: row.x,
      y: row.y,
      mapId: row.map.id,
      mapName: row.map.name,
      mapRevealed: row.map.revealed,
      image: toWorldImage(row.map.world_entry_fields[0]?.value),
    })
  )
}
