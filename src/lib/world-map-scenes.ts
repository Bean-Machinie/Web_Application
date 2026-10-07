import { supabase } from "@/lib/supabase"
import { readPaint, writePaint } from "./biomes/paint-codec"
import { readScene } from "./map-scene"
import type { MapScene } from "./map-scene"

// A scene as loaded. "updatedAt" is passed back on the next save, exactly as
// the database gave it (as text, so no precision is lost).
export type LoadedScene = { scene: MapScene; updatedAt: string; renderedAt: string | null }

// Null when the map was not built in the builder. Only people who can manage
// the world get a row at all.
export async function fetchMapScene(mapId: string): Promise<LoadedScene | null> {
  const { data, error } = await supabase
    .from("world_map_scenes")
    .select("scene, updated_at, rendered_at")
    .eq("map_id", mapId)
    .maybeSingle()
  if (error) throw error
  if (!data) return null

  const scene = readScene(data.scene)
  if (!scene) throw new Error("This map was made with a newer version of the builder.")
  const paint = await readPaint((data.scene as { biomes?: unknown } | null)?.biomes)
  return { scene: { ...scene, paint }, updatedAt: data.updated_at, renderedAt: data.rendered_at }
}

// Whether the map has a scene, without loading it.
export async function hasMapScene(mapId: string) {
  const { count, error } = await supabase
    .from("world_map_scenes")
    .select("map_id", { count: "exact", head: true })
    .eq("map_id", mapId)
  if (error) throw error
  return (count ?? 0) > 0
}

// Creates the scene (expected null) or saves over the one that was loaded, and
// returns the new updated_at. It fails if the scene changed elsewhere since.
export async function saveMapScene(
  mapId: string,
  scene: MapScene,
  expectedUpdatedAt: string | null,
  markRendered = false
) {
  const { paint, ...rest } = scene
  const { data, error } = await supabase.rpc("save_map_scene", {
    target_map: mapId,
    new_scene: { ...rest, biomes: await writePaint(paint) },
    expected_updated_at: expectedUpdatedAt,
    mark_rendered: markRendered,
  })
  if (error) throw error
  return data as string
}

export async function discardMapScene(mapId: string) {
  const { error } = await supabase.rpc("discard_map_scene", { target_map: mapId })
  if (error) throw error
}
