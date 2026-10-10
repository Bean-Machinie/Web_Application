import type Konva from "konva"
import type { RefObject } from "react"
import { Rect, Shape } from "react-konva"
import type { Moving } from "@/lib/map-asset-moving"
import type { AssetInfo } from "@/lib/map-assets"
import type { PlacedAsset } from "@/lib/map-scene"

type Props = {
  asset: PlacedAsset
  // Undefined while the art has not loaded, or if the file was removed.
  info: AssetInfo | undefined
  draggable: boolean
  // Whether this piece is being moved, when it draws itself.
  moving: boolean
  // The moving pieces drawn as one picture, if they are dragged.
  picture: RefObject<Moving | null>
  flatOf: (now: PlacedAsset, info: AssetInfo) => HTMLCanvasElement
  onSelect: (additive: boolean) => void
  handlers: {
    onDragStart: (event: Konva.KonvaEventObject<Event>) => void
    onDragEnd: (event: Konva.KonvaEventObject<DragEvent>) => void
    onTransformStart: (event: Konva.KonvaEventObject<Event>) => void
    onTransformEnd: () => void
  }
}

// Over painted art the pointer is a mover; the empty corners of a picture are
// not art, and Konva only reports the pointer over the painted shape.
const setCursor = (event: Konva.KonvaEventObject<MouseEvent>, cursor: string) => {
  const container = event.target.getStage()?.container()
  if (container) container.style.cursor = cursor
}

// A selected piece: a shape that draws nothing until it is moved, and is there to be
// moved and scaled (see MapAssetsLayer).
export function MapSelectedAsset({ asset, info, draggable, moving, picture, flatOf, onSelect, handlers }: Props) {
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
    draggable,
    onPointerDown: (event: Konva.KonvaEventObject<PointerEvent>) => {
      if (event.evt.button === 0) onSelect(event.evt.shiftKey)
    },
    onMouseEnter: (event: Konva.KonvaEventObject<MouseEvent>) => setCursor(event, "move"),
    onMouseLeave: (event: Konva.KonvaEventObject<MouseEvent>) => setCursor(event, ""),
    ...handlers,
  }
  // Art that is not there (the file was removed) stays as a box, so it
  // can still be found and deleted.
  if (!info) {
    return (
      <Rect {...common} width={100} height={100} offsetX={50} offsetY={50} stroke="#888" dash={[8, 6]} strokeWidth={2} />
    )
  }
  const { trim, hit } = info
  return (
    <Shape
      {...common}
      width={trim.width}
      height={trim.height}
      offsetX={trim.width / 2}
      offsetY={trim.height / 2}
      sceneFunc={(context, shape) => {
        if (!moving) return
        const together = picture.current
        if (together?.ids.has(asset.id)) {
          // One piece of the group draws the picture of all of them.
          if (asset.id !== together.carrier) return
          // Drawn in the canvas's own terms, moved by how far the carrier has gone.
          const back = shape.getTransform().copy().invert().getMatrix()
          context.save()
          context.transform(back[0], back[1], back[2], back[3], back[4], back[5])
          context.drawImage(
            together.canvas,
            together.x + shape.x() - together.from.x,
            together.y + shape.y() - together.from.y,
            together.width,
            together.height
          )
          context.restore()
          return
        }
        // Where the piece is now, as it is moved ahead of the saved scene.
        const now = { ...asset, x: shape.x(), y: shape.y(), scaleX: shape.scaleX(), scaleY: shape.scaleY() }
        context.drawImage(flatOf(now, info), 0, 0, trim.width, trim.height)
      }}
      // Only the painted pixels can be picked.
      hitFunc={(context, shape) => {
        context.setAttr("fillStyle", shape.colorKey)
        context.fill(hit)
      }}
    />
  )
}
