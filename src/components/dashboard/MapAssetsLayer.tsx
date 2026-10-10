import { useEffect, useRef, useState } from "react"
import { flushSync } from "react-dom"
import { T, profileDrag } from "@/lib/temp-timing" // TEMP-TIMING
import type Konva from "konva"
import type { MultiPolygon } from "polygon-clipping"
import { Layer, Rect, Shape } from "react-konva"
import { useAssetInfos } from "@/hooks/use-asset-infos"
import { useAssetPictures } from "@/hooks/use-asset-pictures"
import { useAssetWarmup } from "@/hooks/use-asset-warmup"
import type { BuilderView } from "@/hooks/use-builder-viewport"
import type { Paint } from "@/lib/biomes/paint-tiles"
import type { Surface } from "@/lib/biomes/surface"
import type { Terrain } from "@/lib/terrain"
import { artFor } from "@/lib/map-asset-art"
import { lookAt } from "@/lib/map-asset-painted"
import { drawMoving } from "@/lib/map-asset-moving"
import type { Moving } from "@/lib/map-asset-moving"
import { visibleRect } from "@/lib/view-matrix"
import type { AssetPatch } from "@/lib/map-asset-edit"
import type { MapScene, PlacedAsset } from "@/lib/map-scene"
import type { AssetInfo } from "@/lib/map-assets"
import { themeFor } from "@/lib/map-theme"
import { AssetPictures } from "./AssetPictures"

type Props = {
  assets: PlacedAsset[]
  // False while the art is hidden to paint under it.
  visible: boolean
  // Alt is held, when a press on art drags a copy and the art itself stays put.
  altHeld: boolean
  selected: string[]
  // Set to say which piece the pointer is over, whose art is made ready before it is pressed.
  pointRef: { current: (id: string | null) => void }
  // Whether assets can be picked and moved: only with the select tool.
  editable: boolean
  // Plain click replaces the selection; Shift-click adds or removes one.
  onSelect: (id: string, additive: boolean) => void
  onChange: (patches: AssetPatch[]) => void
  // What the art is drawn over, for the pictures of it.
  canvas: MapScene["canvas"]
  land: MultiPolygon
  paint: Paint
  surface: Surface
  terrain: Terrain
  backdrop: HTMLCanvasElement
  view: BuilderView
  size: { width: number; height: number }
}

const DRAG = { live: false, frameWorst: 0, slow: 0, frames: 0, draws: 0, cost: 0, worst: 0, moves: 0, last: 0, gap: 0, worstGap: 0 } // TEMP-TIMING
const NONE: ReadonlySet<string> = new Set()
// A piece that was let go stops drawing itself after this long, if nothing
// changed to take over from it.
const LETTING_GO_MS = 250
// The moving pieces are drawn for what is in sight and this share of the screen around it.
const MARGIN = 0.25

const patchOf = (node: Konva.Node): AssetPatch => ({
  id: node.id(),
  x: node.x(),
  y: node.y(),
  scaleX: node.scaleX(),
  scaleY: node.scaleY(),
  rotation: node.rotation(),
})

// Over painted art the pointer is a mover; the empty corners of a picture are
// not art, and Konva only reports the pointer over the painted shape.
const setCursor = (event: Konva.KonvaEventObject<MouseEvent>, cursor: string) => {
  const container = event.target.getStage()?.container()
  if (container) container.style.cursor = cursor
}

// The placed art, above the land, drawn as pictures: the art is ink, and where
// it is solid the ground shows through it (see useAssetPictures). Only the
// selected pieces are shapes, which draw nothing and are there to be moved and
// scaled: a shape for every piece makes the layer slow to redraw. The rest are
// picked by place (see useAssetPick). A piece that is being moved draws itself,
// in flat colour, until it is let go. The shapes are a layer of their own, so that
// moving one redraws only that, and not the big pictures under it.
export function MapAssetsLayer(props: Props) {
  const { assets, selected, editable, onSelect, onChange, canvas, view } = props
  const infoOf = useAssetInfos(assets.map((asset) => asset.asset))
  // The pieces being moved, as long as the assets are the ones they were moved from.
  const [movement, setMovement] = useState<{ ids: ReadonlySet<string>; from: PlacedAsset[] } | null>(null)
  const moving = movement && movement.from === assets ? movement.ids : NONE
  const { pictures, version } = useAssetPictures({ ...props, hidden: moving })
  // The pictures are redrawn in place, which no prop says, so the layer is told.
  const picturesLayer = useRef<Konva.Layer>(null)
  useEffect(() => {
    picturesLayer.current?.batchDraw()
  }, [version, pictures])
  const theme = themeFor(canvas.background)
  const [pointed, setPointed] = useState<string | null>(null)
  useEffect(() => {
    props.pointRef.current = setPointed
    return () => {
      props.pointRef.current = () => {}
    }
  }, [props.pointRef])
  const chosen = assets.filter((asset) => selected.includes(asset.id))
  useAssetWarmup(chosen, assets.filter((asset) => asset.id === pointed && !selected.includes(asset.id)), infoOf, view.scale, canvas.background)

  // The timer that ends a movement. A piece taken up again before it runs must
  // not have its new movement ended by it.
  const ending = useRef<number | undefined>(undefined)
  // The moving pieces drawn as one picture, while they are dragged.
  const group = useRef<Moving | null>(null)
  // A piece in flat colour, as it is moved: the art where it stands, in its biome's colours.
  const flatOf = (now: PlacedAsset, info: AssetInfo) => {
    const drawn = info.trim.width * Math.abs(now.scaleX) * view.scale
    return info.colour
      ? lookAt({ asset: now, info }, props.paint, canvas.background, drawn)
      : artFor(now.asset, info, drawn, theme.ink, theme.land.fill).preview
  }
  const startDrag = (event: Konva.KonvaEventObject<Event>) => {
    const t0 = performance.now() // TEMP-TIMING
    T.t0 = t0
    profileDrag()
    T.dragging = true
    const dragged = event.target.id()
    const ids = new Set(selected.includes(dragged) ? selected : [dragged])
    const pieces = assets.flatMap((asset) => {
      const info = infoOf(asset.asset)
      return ids.has(asset.id) && info ? [{ asset, info }] : []
    })
    const { left, top, right, bottom } = visibleRect(view, props.size, canvas, MARGIN)
    const region = { x: left, y: top, width: right - left, height: bottom - top }
    const tBuild = performance.now() // TEMP-TIMING
    group.current = right > left && bottom > top ? drawMoving(pieces, flatOf, region, view.scale * window.devicePixelRatio) : null
    const built = performance.now() - tBuild // TEMP-TIMING
    start(event)
    // TEMP-TIMING: how long the press holds the thread, and when the next frame comes.
    const sync = performance.now() - t0
    let lastFrame = performance.now()
    const frame = (now: number) => {
      if (!DRAG.live) return
      DRAG.frames++
      DRAG.frameWorst = Math.max(DRAG.frameWorst, now - lastFrame)
      if (now - lastFrame > 24) DRAG.slow++
      lastFrame = now
      requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
    requestAnimationFrame(() =>
      console.log(`[startDrag] picture=${built.toFixed(0)}ms | all sync work=${sync.toFixed(0)}ms | next frame after +${(performance.now() - t0).toFixed(0)}ms | pieces=${pieces.length}`)
    )
  }
  const startTransform = (event: Konva.KonvaEventObject<Event>) => {
    group.current = null
    start(event)
  }
  const start = (event: Konva.KonvaEventObject<Event>) => {
    window.clearTimeout(ending.current)
    Object.assign(DRAG, { live: true, frameWorst: 0, slow: 0, frames: 0, draws: 0, cost: 0, worst: 0, moves: 0, last: 0, gap: 0, worstGap: 0 }) // TEMP-TIMING
    const dragged = event.target.id()
    const next = { ids: new Set(selected.includes(dragged) ? selected : [dragged]), from: assets }
    // At once, not a frame later: until the pictures stop showing the piece, it would stay behind
    // the pointer. A drag begun by code, from a React effect, has no event and cannot be flushed.
    if (event.evt) flushSync(() => setMovement(next))
    else setMovement(next)
  }
  const letGo = () => {
    window.clearTimeout(ending.current)
    ending.current = window.setTimeout(() => {
      group.current = null
      setMovement(null)
    }, LETTING_GO_MS)
  }

  // The Transformer carries the whole selection along with the piece that is
  // dragged, and every piece of it ends its drag in turn, each saying so. What moved is
  // saved once, as one change, so that one undo takes the whole movement back.
  const saving = useRef(false)
  const probe = () => { // TEMP-TIMING
    const now = performance.now()
    if (DRAG.last) {
      DRAG.gap += now - DRAG.last
      DRAG.worstGap = Math.max(DRAG.worstGap, now - DRAG.last)
    }
    DRAG.last = now
    DRAG.moves++
  }
  const finish = (event: Konva.KonvaEventObject<DragEvent>) => {
    if (!saving.current) { DRAG.live = false; T.dragging = false } // TEMP-TIMING
    if (DRAG.moves > 1 && !saving.current) // TEMP-TIMING
      console.log(`[drag] moves=${DRAG.moves} avgGap=${(DRAG.gap / (DRAG.moves - 1)).toFixed(1)}ms worstGap=${DRAG.worstGap.toFixed(0)}ms | sceneFunc calls=${DRAG.draws} avg=${(DRAG.cost / Math.max(DRAG.draws, 1)).toFixed(2)}ms worst=${DRAG.worst.toFixed(1)}ms total/move=${(DRAG.cost / DRAG.moves).toFixed(1)}ms selected=${selected.length} | FRAMES=${DRAG.frames} slow(>24ms)=${DRAG.slow} worstFrame=${DRAG.frameWorst.toFixed(0)}ms`)
    const layer = event.target.getLayer()
    const dragged = event.target.id()
    const ids = selected.includes(dragged) ? selected : [dragged]
    letGo()
    if (saving.current) return
    saving.current = true
    // After the rest of the selection has ended its drag, which is all in this moment.
    window.setTimeout(() => {
      saving.current = false
      const nodes = ids
        .map((id) => layer?.findOne(`#${id}`))
        .filter((node): node is Konva.Node => Boolean(node))
      onChange(nodes.map(patchOf))
    }, 0)
  }

  return (
    <>
      <Layer ref={picturesLayer} name="assets-pictures" listening={false} visible={props.visible}>
        <AssetPictures overview={pictures.overview} canvas={canvas} sharp={pictures.view} />
      </Layer>
      <Layer listening={editable}>
        {chosen.map((asset) => {
          const info = infoOf(asset.asset)
          const common = {
            id: asset.id,
            name: "asset",
            // The middle of the painted art is the piece's origin, so it turns and
            // flips about what can be seen.
            x: asset.x,
            y: asset.y,
            scaleX: asset.scaleX,
            scaleY: asset.scaleY,
            rotation: asset.rotation,
            draggable: editable && !props.altHeld,
            onPointerDown: (event: Konva.KonvaEventObject<PointerEvent>) => {
              if (event.evt.button === 0) onSelect(asset.id, event.evt.shiftKey)
            },
            onMouseEnter: (event: Konva.KonvaEventObject<MouseEvent>) => setCursor(event, "move"),
            onMouseLeave: (event: Konva.KonvaEventObject<MouseEvent>) => setCursor(event, ""),
            onDragMove: probe, // TEMP-TIMING
            onDragStart: startDrag,
            onDragEnd: finish,
            onTransformStart: startTransform,
            onTransformEnd: letGo,
          }
          // Art that is not there (the file was removed) stays as a box, so it
          // can still be found and deleted.
          if (!info) {
            return (
              <Rect
                key={asset.id}
                {...common}
                width={100}
                height={100}
                offsetX={50}
                offsetY={50}
                stroke="#888"
                dash={[8, 6]}
                strokeWidth={2}
              />
            )
          }
          const { trim, hit } = info
          return (
            <Shape
              key={asset.id}
              {...common}
              width={trim.width}
              height={trim.height}
              offsetX={trim.width / 2}
              offsetY={trim.height / 2}
              sceneFunc={(context, shape) => {
                if (!moving.has(asset.id)) return
                const t0 = performance.now() // TEMP-TIMING
                const picture = group.current
                if (picture?.ids.has(asset.id)) {
                  if (asset.id !== picture.carrier) return
                  // Drawn in the canvas's own terms, moved by how far the carrier has gone.
                  const back = shape.getTransform().copy().invert().getMatrix()
                  context.save()
                  context.transform(back[0], back[1], back[2], back[3], back[4], back[5])
                  context.drawImage(
                    picture.canvas,
                    picture.x + shape.x() - picture.from.x,
                    picture.y + shape.y() - picture.from.y,
                    picture.width,
                    picture.height
                  )
                  context.restore()
                  return
                }
                // Where the piece is now, as it is moved ahead of the saved scene.
                const now = { ...asset, x: shape.x(), y: shape.y(), scaleX: shape.scaleX(), scaleY: shape.scaleY() }
                context.drawImage(flatOf(now, info), 0, 0, trim.width, trim.height)
                const took = performance.now() - t0 // TEMP-TIMING
                DRAG.draws++
                DRAG.cost += took
                DRAG.worst = Math.max(DRAG.worst, took)
              }}
              // Only the painted pixels can be picked.
              hitFunc={(context, shape) => {
                context.setAttr("fillStyle", shape.colorKey)
                context.fill(hit)
              }}
            />
          )
        })}
      </Layer>
    </>
  )
}
