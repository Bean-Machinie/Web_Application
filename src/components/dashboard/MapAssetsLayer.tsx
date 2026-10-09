import { useEffect, useRef, useState } from "react"
import type Konva from "konva"
import type { MultiPolygon } from "polygon-clipping"
import { Layer, Rect, Shape } from "react-konva"
import { useAssetInfos } from "@/hooks/use-asset-infos"
import { useAssetPictures } from "@/hooks/use-asset-pictures"
import type { BuilderView } from "@/hooks/use-builder-viewport"
import type { Paint } from "@/lib/biomes/paint-tiles"
import type { Surface } from "@/lib/biomes/surface"
import type { Terrain } from "@/lib/terrain"
import { artFor } from "@/lib/map-asset-art"
import { lookAt } from "@/lib/map-asset-painted"
import type { AssetPatch } from "@/lib/map-asset-edit"
import type { MapScene, PlacedAsset } from "@/lib/map-scene"
import { themeFor } from "@/lib/map-theme"
import { AssetPictures } from "./AssetPictures"

type Props = {
  assets: PlacedAsset[]
  // False while the art is hidden to paint under it.
  visible: boolean
  // Alt is held, when a press on art drags a copy and the art itself stays put.
  altHeld: boolean
  selected: string[]
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

const NONE: ReadonlySet<string> = new Set()
// A piece that was let go stops drawing itself after this long, if nothing
// changed to take over from it.
const LETTING_GO_MS = 250

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

  // The timer that ends a movement. A piece taken up again before it runs must
  // not have its new movement ended by it.
  const ending = useRef<number | undefined>(undefined)
  const start = (event: Konva.KonvaEventObject<Event>) => {
    window.clearTimeout(ending.current)
    const dragged = event.target.id()
    setMovement({ ids: new Set(selected.includes(dragged) ? selected : [dragged]), from: assets })
  }
  const letGo = () => {
    window.clearTimeout(ending.current)
    ending.current = window.setTimeout(() => setMovement(null), LETTING_GO_MS)
  }

  // The Transformer carries the whole selection along with the piece that is
  // dragged, and every piece of it ends its drag in turn, each saying so. What moved is
  // saved once, as one change, so that one undo takes the whole movement back.
  const saving = useRef(false)
  const finish = (event: Konva.KonvaEventObject<DragEvent>) => {
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
        {assets.filter((asset) => selected.includes(asset.id)).map((asset) => {
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
            onDragStart: start,
            onDragEnd: finish,
            onTransformStart: start,
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
                // Where the piece is now, as it is moved ahead of the saved scene.
                const now = { ...asset, x: shape.x(), y: shape.y(), scaleX: shape.scaleX(), scaleY: shape.scaleY() }
                const drawn = trim.width * Math.abs(now.scaleX) * view.scale
                const flat = info.colour
                  ? lookAt({ asset: now, info }, props.paint, canvas.background, drawn)
                  : artFor(asset.asset, info, drawn, theme.ink, theme.land.fill).preview
                context.drawImage(flat, 0, 0, trim.width, trim.height)
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
