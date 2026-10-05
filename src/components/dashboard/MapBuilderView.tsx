import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { FormAlert } from "@/components/auth/FormAlert"
import { Skeleton } from "@/components/ui/skeleton"
import { useWorldEntry } from "@/hooks/use-world-entry"
import { useWorldFields } from "@/hooks/use-world-fields"
import { errorMessage } from "@/lib/campaigns"
import { toWorldImage } from "@/lib/world-images"
import { COVER_FIELD } from "@/lib/world-kinds"
import { fetchMapScene } from "@/lib/world-map-scenes"
import type { LoadedScene } from "@/lib/world-map-scenes"
import { MapBuilder } from "./MapBuilder"
import { useCampaign } from "./useCampaign"

// Loads what the builder needs and lets in only a GM, for a map that has a
// scene; anyone else lands back on the entry. Render with key={entryId}.
export function MapBuilderView({ entryId }: { entryId: string }) {
  const { can, current } = useCampaign()
  const { entry, error } = useWorldEntry(entryId)
  const state = useWorldFields(entryId, entry?.kind)
  const [loaded, setLoaded] = useState<LoadedScene | null | undefined>(undefined)
  const [sceneError, setSceneError] = useState<string | null>(null)
  const allowed = can("manage_world") && entry?.kind === "map"

  useEffect(() => {
    if (!allowed) return
    fetchMapScene(entryId)
      .then(setLoaded)
      .catch((failure) => setSceneError(errorMessage(failure)))
  }, [entryId, allowed])

  const failure = error ?? sceneError
  if (failure) {
    return (
      <div className="p-6">
        <FormAlert tone="error">{failure}</FormAlert>
      </div>
    )
  }
  if (entry === undefined) return <Skeleton className="fixed inset-0 z-50 rounded-none" />
  if (!allowed || loaded === null) return <Navigate to={`/app/world/${entryId}`} replace />
  if (!loaded || !state.fields || !current) {
    return <Skeleton className="fixed inset-0 z-50 rounded-none" />
  }

  return (
    <MapBuilder
      campaignId={current.id}
      mapId={entryId}
      name={entry!.name}
      loaded={loaded}
      image={toWorldImage(state.fields[COVER_FIELD]?.value)}
      onSaveImage={(value) => state.saveNow(COVER_FIELD, "image", value)}
    />
  )
}
