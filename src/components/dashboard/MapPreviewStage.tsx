import { useEffect, useMemo, useRef } from "react"
import type Konva from "konva"
import { Stage } from "react-konva"
import { useBiomeSurface } from "@/hooks/use-biome-surface"
import { useDetailSurface } from "@/hooks/use-detail-surface"
import { useShownLand } from "@/hooks/use-shown-land"
import { useTerrain } from "@/hooks/use-terrain"
import { canvasToWebp } from "@/lib/encode-webp"
import { drawScene } from "@/lib/map-export"
import { loadAssetInfo } from "@/lib/map-assets"
import { finishPreview, previewScale } from "@/lib/map-preview"
import type { PreviewJob } from "@/lib/map-preview"
import { MapSceneLayers } from "./MapSceneLayers"

const NO_ART: ReadonlySet<string> = new Set()
const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve))
// The stage only has to exist; the picture is drawn at its own size from the scene.
const SIZE = { width: 320, height: 240 }
const VIEW = { x: 0, y: 0, scale: 1, rotation: 0, flipH: false, flipV: false }

function PreviewCanvas({ job, terrain }: { job: PreviewJob; terrain: NonNullable<ReturnType<typeof useTerrain>> }) {
  const { scene } = job
  const { canvas } = scene
  const stage = useRef<Konva.Stage>(null)
  const started = useRef(false)
  const land = useShownLand(scene.land, scene.style.roundness, canvas, scene.pinned)
  const surface = useBiomeSurface(canvas, terrain)
  const detailSurface = useDetailSurface(canvas, terrain)
  const assets = useMemo(
    () => ({ visible: true, altHeld: false, selected: [], fading: NO_ART, editable: false, onSelect: () => {}, onChange: () => {} }),
    []
  )

  useEffect(() => {
    // Development runs effects twice; one picture is enough.
    if (started.current) return
    started.current = true

    void (async () => {
      try {
        // Art still loading would be missing from the picture, as when publishing.
        await Promise.all(scene.assets.map((asset) => loadAssetInfo(asset.asset)))
        await nextFrame()
        await nextFrame()
        const drawn = await drawScene(stage.current!, scene, previewScale(canvas, job.maxSide))
        const picture = await canvasToWebp(drawn, 0.85)
        finishPreview(job, {
          preview: { url: URL.createObjectURL(picture), width: drawn.width, height: drawn.height },
        })
      } catch (error) {
        finishPreview(job, { error })
      }
    })()
  }, [job, scene, canvas])

  return (
    <Stage ref={stage} width={SIZE.width} height={SIZE.height}>
      <MapSceneLayers
        scene={scene}
        terrain={terrain}
        land={land}
        surface={surface}
        detailSurface={detailSurface}
        view={VIEW}
        size={SIZE}
        assets={assets}
      />
    </Stage>
  )
}

// Draws one preview on a stage of its own, which nobody sees.
export function MapPreviewStage({ job }: { job: PreviewJob }) {
  const terrain = useTerrain(job.scene.canvas)
  return terrain ? <PreviewCanvas job={job} terrain={terrain} /> : null
}
