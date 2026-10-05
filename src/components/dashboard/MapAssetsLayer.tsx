import type Konva from "konva"
import { Image as KonvaImage, Layer, Rect } from "react-konva"
import { useAssetInfos } from "@/hooks/use-asset-infos"
import { bottomEdge } from "@/lib/map-asset-edit"
import type { AssetPatch } from "@/lib/map-asset-edit"
import type { AssetInfo } from "@/lib/map-assets"
import type { PlacedAsset } from "@/lib/map-scene"

type Props = {
  assets: PlacedAsset[]
  selected: string[]
  // Whether assets can be picked and moved: only with the select tool.
  editable: boolean
  // Plain click replaces the selection; Shift-click adds or removes one.
  onSelect: (id: string, additive: boolean) => void
  onChange: (patches: AssetPatch[]) => void
}

type InfoOf = (id: string) => AssetInfo | undefined

const bottom = (asset: PlacedAsset, infoOf: InfoOf) => {
  const trim = infoOf(asset.asset)?.trim
  return bottomEdge(asset, trim?.width ?? 100, trim?.height ?? 100)
}

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

// The placed art, above the land. Each piece is only what is painted: the empty
// margin of its picture is trimmed off, and a click on a clear pixel goes to
// whatever is behind. What a piece is, and where it is painted, is worked out
// once per kind of art and shared by every copy.
export function MapAssetsLayer({ assets, selected, editable, onSelect, onChange }: Props) {
  const infoOf = useAssetInfos(assets.map((asset) => asset.asset))

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
  }

  // Drawn by the lowest point of each, so what is lower on the map is in front.
  // The sort is stable, so equal ones keep the order they were placed in.
  const sorted = [...assets].sort((a, b) => bottom(a, infoOf) - bottom(b, infoOf))

  return (
    <Layer listening={editable}>
      {sorted.map((asset) => {
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
          onDragEnd: finish,
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
        const { image, trim, hit } = info
        return (
          <KonvaImage
            key={asset.id}
            {...common}
            image={image}
            crop={trim}
            width={trim.width}
            height={trim.height}
            offsetX={trim.width / 2}
            offsetY={trim.height / 2}
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
