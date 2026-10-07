import { useEffect, useState } from "react"
import type { useBuilderViewport } from "@/hooks/use-builder-viewport"
import type { MapScene } from "@/lib/map-scene"
import type { Terrain } from "@/lib/terrain"
import { MapNavigatorView } from "./MapNavigatorView"
import { MapZoomControls } from "./MapZoomControls"

type Props = {
  scene: MapScene
  terrain: Terrain | null
  viewport: ReturnType<typeof useBuilderViewport>
}

// Where you are on the map, and how far in: a small picture of all of it to find
// a place on, and the zoom. The picture shrinks and grows with the panel.
export function MapNavigator({ scene, terrain, viewport }: Props) {
  // The zoom as it is now, even while it is being dragged, which "view" says after.
  const { subscribe, liveView } = viewport
  const [zoom, setZoom] = useState(() => liveView().scale)
  useEffect(() => {
    setZoom(liveView().scale)
    return subscribe((view) => setZoom(view.scale))
  }, [subscribe, liveView])

  // The picture takes what room there is above the controls, which keep theirs: they
  // are never pushed out, however small the panel is made.
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex min-h-0 flex-1 items-center justify-center [container-type:size]">
        <MapNavigatorView scene={scene} terrain={terrain} viewport={viewport} />
      </div>
      <MapZoomControls
        zoom={zoom}
        limits={viewport.limits}
        onZoomTo={viewport.zoomTo}
        onZoomBy={viewport.zoomBy}
        onFit={viewport.fit}
      />
    </div>
  )
}
