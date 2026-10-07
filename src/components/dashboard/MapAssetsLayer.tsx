import { useState } from "react"
import type Konva from "konva"
import type { MultiPolygon } from "polygon-clipping"
import { Image as KonvaImage, Layer, Rect, Shape } from "react-konva"
import { useAssetInfos } from "@/hooks/use-asset-infos"
import { useAssetPictures } from "@/hooks/use-asset-pictures"
import type { BuilderView } from "@/hooks/use-builder-viewport"
import type { Paint } from "@/lib/biomes/paint-tiles"
import type { Surface } from "@/lib/biomes/surface"
import { artFor } from "@/lib/map-asset-art"
import { paintedArtFor } from "@/lib/map-asset-paint"
import type { AssetPatch } from "@/lib/map-asset-edit"
import type { MapScene, PlacedAsset } from "@/lib/map-scene"
import { themeFor } from "@/lib/map-theme"

type Props = {
  assets: PlacedAsset[]
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
// it is solid the ground shows through it (see useAssetPictures). The pieces
// themselves are shapes that draw nothing and are only there to be picked,
// moved and scaled, and a click on a clear pixel goes to whatever is behind.
// A piece that is being moved draws itself, in flat colour, until it is let go.
export function MapAssetsLayer(props: Props) {
  const { assets, selected, editable, onSelect, onChange, canvas, view, size } = props
  const infoOf = useAssetInfos(assets.map((asset) => asset.asset))
  // The pieces being moved, as long as the assets are the ones they were moved from.
  const [movement, setMovement] = useState<{ ids: ReadonlySet<string>; from: PlacedAsset[] } | null>(null)
  const moving = movement && movement.from === assets ? movement.ids : NONE
  const { pictures } = useAssetPictures({ ...props, hidden: moving })
  const theme = themeFor(canvas.background)

  const start = (event: Konva.KonvaEventObject<Event>) => {
    const dragged = event.target.id()
    setMovement({ ids: new Set(selected.includes(dragged) ? selected : [dragged]), from: assets })
  }
  const letGo = () => {
    window.setTimeout(() => setMovement(null), LETTING_GO_MS)
  }

  // The Transformer carries the whole selection along with the piece that is
  // dragged; once it is let go, what moved is saved as one change.
  const finish = (event: Konva.KonvaEventObject<DragEvent>) => {
    const layer = event.target.getLayer()
    const dragged = event.target.id()
    const ids = selected.includes(dragged) ? selected : [dragged]
    const nodes = ids
      .map((id) => layer?.findOne(`#${id}`))
      .filter((node): node is Konva.Node => Boolean(node))
    onChange(nodes.map(patchOf))
    letGo()
  }

  // The sharp picture stands in for the overview where it covers what is in
  // sight; otherwise the overview shows, so there is never an empty edge.
  const sharp = pictures.view
  const left = Math.max(-view.x / view.scale, 0)
  const top = Math.max(-view.y / view.scale, 0)
  const right = Math.min((size.width - view.x) / view.scale, canvas.width)
  const bottom = Math.min((size.height - view.y) / view.scale, canvas.height)
  const covered =
    sharp !== null &&
    sharp.x <= left + 1 &&
    sharp.y <= top + 1 &&
    sharp.x + sharp.canvas.width / sharp.scale >= right - 1 &&
    sharp.y + sharp.canvas.height / sharp.scale >= bottom - 1
  const whole = pictures.overview

  return (
    <Layer listening={editable}>
      <KonvaImage
        name="assets-overview"
        image={whole.canvas}
        width={canvas.width}
        height={canvas.height}
        visible={!covered}
        listening={false}
      />
      {sharp && (
        <KonvaImage
          name="assets-view"
          image={sharp.canvas}
          x={sharp.x}
          y={sharp.y}
          width={sharp.canvas.width / sharp.scale}
          height={sharp.canvas.height / sharp.scale}
          listening={false}
        />
      )}
      {assets.map((asset) => {
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
          draggable: editable,
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
            sceneFunc={(context) => {
              if (!moving.has(asset.id)) return
              const drawn = trim.width * Math.abs(asset.scaleX) * view.scale
              const flat = info.colour
                ? paintedArtFor(asset.asset, info, drawn, canvas.background, false).base
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
  )
}
