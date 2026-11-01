import { lazy, Suspense, useSyncExternalStore } from "react"
import { currentPreview, subscribePreview } from "@/lib/map-preview"

// The drawing brings Konva with it, so it loads only when a preview is wanted.
const MapPreviewStage = lazy(() => import("./MapPreviewStage").then((module) => ({ default: module.MapPreviewStage })))

// Mounted once for the app. While a preview is being made it holds the stage that draws it, off
// the screen; the rest of the time it is empty.
export function MapPreviewHost() {
  const job = useSyncExternalStore(subscribePreview, currentPreview)
  if (!job) return null

  return (
    <div aria-hidden className="pointer-events-none fixed top-0 -left-[9999px] size-0 overflow-hidden">
      <Suspense fallback={null}>
        <MapPreviewStage key={job.key} job={job} />
      </Suspense>
    </div>
  )
}
