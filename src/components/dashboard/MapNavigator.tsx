import { useEffect, useState } from "react"
import type { useBuilderViewport } from "@/hooks/use-builder-viewport"
import type { MapScene } from "@/lib/map-scene"
import type { Terrain } from "@/lib/terrain"
import { MapControlGrid } from "./MapControlGrid"
import { MapNavigatorView } from "./MapNavigatorView"
import { MapRotateControls } from "./MapRotateControls"
import { MapZoomControls } from "./MapZoomControls"

type Props = {
  scene: MapScene
  terrain: Terrain | null
  viewport: ReturnType<typeof useBuilderViewport>
}

// Where you are on the map, and how far in and how it is turned: a small picture of
// all of it to find a place on, the zoom, and the rotation. The picture shrinks and
// grows with the panel.
export function MapNavigator({ scene, terrain, viewport }: Props) {
  // The zoom and turn as they are now, even while being dragged, which "view" says after.
  const { subscribe, liveView } = viewport
  const [seen, setSeen] = useState(() => liveView())
  useEffect(() => {
    setSeen(liveView())
    return subscribe(setSeen)
  }, [subscribe, liveView])

  // The picture takes what room there is above the controls, which keep theirs: they
  // are never pushed out, however small the panel is made.
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex min-h-0 flex-1 items-center justify-center [container-type:size]">
        <MapNavigatorView scene={scene} terrain={terrain} viewport={viewport} />
      </div>
      <MapControlGrid>
        <MapZoomControls
          zoom={seen.scale}
          limits={viewport.limits}
          onZoomTo={viewport.zoomTo}
          onZoomBy={viewport.zoomBy}
          onFlipH={() => viewport.flip("h")}
        />
        <MapRotateControls
          rotation={seen.rotation}
          onRotateTo={viewport.rotateTo}
          onRotateLeft={viewport.rotateLeft}
          onRotateRight={viewport.rotateRight}
          onReset={viewport.resetTurn}
          onFlipV={() => viewport.flip("v")}
        />
      </MapControlGrid>
    </div>
  )
}
