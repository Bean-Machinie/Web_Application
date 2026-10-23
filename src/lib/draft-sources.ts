import { Map as MapIcon } from "lucide-react"
import type { DraftSource } from "./drafts"
import { fetchSceneStates, inProgress } from "./world-map-scenes"

// Library maps whose scene was saved after their last publish, or never published.
const mapDrafts: DraftSource = async ({ scope, entries }) => {
  const maps = entries.filter((entry) => entry.kind === "map")
  const scenes = new Map((await fetchSceneStates(maps.map((map) => map.id))).map((scene) => [scene.mapId, scene]))
  return maps.flatMap((map) => {
    const scene = scenes.get(map.id)
    if (!scene || !inProgress(scene)) return []
    return [
      {
        id: map.id,
        label: "Map",
        icon: MapIcon,
        name: map.name,
        imageUrl: map.imageUrl,
        updatedAt: scene.updatedAt,
        to: `${scope.basePath}/${map.id}/build`,
      },
    ]
  })
}

// Every tool's drafts. The character creator adds its source here.
export const DRAFT_SOURCES: DraftSource[] = [mapDrafts]
