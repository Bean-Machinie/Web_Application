import { lazy, Suspense } from "react"
import type { MapImageUpload } from "@/hooks/use-map-image-upload"
import { useMapPreview } from "@/hooks/use-map-preview"
import { BUILT_MAX_ZOOM } from "@/lib/map-scene"
import { MapBuildAction } from "./MapBuildAction"
import { MapDraftBar } from "./MapDraftBar"
import { MapEmptyState } from "./MapEmptyState"
import { MapLoader } from "./MapLoader"
import { MapUploadPrompt } from "./MapUploadPrompt"

// The viewer brings Leaflet with it, so it loads only when there is a map to show.
const MapViewer = lazy(() => import("./MapViewer").then((module) => ({ default: module.MapViewer })))

type Props = {
  mapId: string
  mapName: string
  canManage: boolean
  upload: MapImageUpload
  built: boolean
  onDetails: () => void
}

// What a map shows before it has a published image: its saved scene as a draft, in the same
// viewer as a published map (so it zooms, pans and takes markers), or, with none, the way to
// begin. Anyone who cannot manage it, or a picture that could not be made, gets the plain
// upload prompt.
export function MapNoImage({ mapId, mapName, canManage, upload, built, onDetails }: Props) {
  const preview = useMapPreview(mapId, canManage, 1600)

  if (canManage && preview.status === "loading") return <MapLoader />

  if (preview.status === "draft") {
    return (
      <>
        <Suspense fallback={<MapLoader />}>
          <MapViewer
            // A new picture starts a new view, with its own bounds.
            key={preview.url}
            mapId={mapId}
            mapName={mapName}
            image={{ url: preview.url, width: preview.width, height: preview.height, maxZoom: BUILT_MAX_ZOOM }}
            canManage={canManage}
            onDetails={onDetails}
          />
        </Suspense>
        <MapDraftBar mapId={mapId} />
      </>
    )
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center p-6">
      {canManage && preview.status === "none" ? (
        <MapEmptyState mapId={mapId} upload={upload} />
      ) : (
        <div className="w-full max-w-xl">
          <MapUploadPrompt canManage={canManage} upload={upload} />
          {canManage && (
            <div className="mt-3 flex justify-center">
              <MapBuildAction mapId={mapId} built={built} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
