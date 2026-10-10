import { useRef, useState } from "react"
import type Konva from "konva"
import type { Paint } from "@/lib/biomes/paint-tiles"
import { artFor } from "@/lib/map-asset-art"
import type { AssetPatch } from "@/lib/map-asset-edit"
import { drawMoving } from "@/lib/map-asset-moving"
import type { Moving } from "@/lib/map-asset-moving"
import { lookAt } from "@/lib/map-asset-painted"
import type { AssetInfo } from "@/lib/map-assets"
import type { MapScene, PlacedAsset } from "@/lib/map-scene"
import { themeFor } from "@/lib/map-theme"
import { visibleRect } from "@/lib/view-matrix"
import type { BuilderView } from "./use-builder-viewport"

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

type Input = {
  assets: PlacedAsset[]
  selected: string[]
  infoOf: (id: string) => AssetInfo | undefined
  canvas: MapScene["canvas"]
  paint: Paint
  view: BuilderView
  size: { width: number; height: number }
  onChange: (patches: AssetPatch[]) => void
}

// Which pieces are being moved, and how they are drawn while they are: a piece that
// is moved draws itself in flat colour until it is let go. Dragged, they are drawn
// once as one picture and that is moved, so that a large selection costs no more
// than a small one; scaled or turned, each is drawn as it stands.
export function useAssetMovement({ assets, selected, infoOf, canvas, paint, view, size, onChange }: Input) {
  // The pieces being moved, as long as the assets are the ones they were moved from.
  const [movement, setMovement] = useState<{ ids: ReadonlySet<string>; from: PlacedAsset[] } | null>(null)
  const moving = movement && movement.from === assets ? movement.ids : NONE
  const theme = themeFor(canvas.background)
  // The moving pieces drawn as one picture, while they are dragged.
  const picture = useRef<Moving | null>(null)

  // A piece in flat colour, as it is moved: the art where it stands, in its biome's colours.
  const flatOf = (now: PlacedAsset, info: AssetInfo) => {
    const drawn = info.trim.width * Math.abs(now.scaleX) * view.scale
    return info.colour
      ? lookAt({ asset: now, info }, paint, canvas.background, drawn)
      : artFor(now.asset, info, drawn, theme.ink, theme.land.fill).preview
  }

  // The piece that was touched, or the whole selection if it is part of it.
  const movedWith = (dragged: string) => (selected.includes(dragged) ? selected : [dragged])

  // The timer that ends a movement. A piece taken up again before it runs must
  // not have its new movement ended by it.
  const ending = useRef<number | undefined>(undefined)
  const start = (event: Konva.KonvaEventObject<Event>) => {
    window.clearTimeout(ending.current)
    setMovement({ ids: new Set(movedWith(event.target.id())), from: assets })
  }
  const startDrag = (event: Konva.KonvaEventObject<Event>) => {
    const ids = new Set(movedWith(event.target.id()))
    const pieces = assets.flatMap((asset) => {
      const info = infoOf(asset.asset)
      return ids.has(asset.id) && info ? [{ asset, info }] : []
    })
    const { left, top, right, bottom } = visibleRect(view, size, canvas, MARGIN)
    const region = { x: left, y: top, width: right - left, height: bottom - top }
    picture.current =
      right > left && bottom > top ? drawMoving(pieces, flatOf, region, view.scale * window.devicePixelRatio) : null
    start(event)
  }
  const startTransform = (event: Konva.KonvaEventObject<Event>) => {
    picture.current = null
    start(event)
  }
  const letGo = () => {
    window.clearTimeout(ending.current)
    ending.current = window.setTimeout(() => {
      picture.current = null
      setMovement(null)
    }, LETTING_GO_MS)
  }

  // The Transformer carries the whole selection along with the piece that is
  // dragged, and every piece of it ends its drag in turn, each saying so. What moved is
  // saved once, as one change, so that one undo takes the whole movement back.
  const saving = useRef(false)
  const finish = (event: Konva.KonvaEventObject<DragEvent>) => {
    const layer = event.target.getLayer()
    const ids = movedWith(event.target.id())
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

  return {
    moving,
    picture,
    flatOf,
    handlers: { onDragStart: startDrag, onDragEnd: finish, onTransformStart: startTransform, onTransformEnd: letGo },
  }
}
