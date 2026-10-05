import type Konva from "konva"
import { Image as KonvaImage, Layer, Rect } from "react-konva"
import { useAssetImages } from "@/hooks/use-asset-images"
import { bottomEdge } from "@/lib/map-asset-edit"
import type { AssetPatch } from "@/lib/map-asset-edit"
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

const bottom = (asset: PlacedAsset, imageOf: (id: string) => HTMLImageElement | undefined) => {
  const image = imageOf(asset.asset)
  return bottomEdge(asset, image?.naturalWidth ?? 100, image?.naturalHeight ?? 100)
}

const patchOf = (node: Konva.Node): AssetPatch => ({
  id: node.id(),
  x: node.x(),
  y: node.y(),
  scaleX: node.scaleX(),
  scaleY: node.scaleY(),
  rotation: node.rotation(),
})

// The placed art, above the land, each piece drawn about its own middle.
export function MapAssetsLayer({ assets, selected, editable, onSelect, onChange }: Props) {
  const imageOf = useAssetImages(assets.map((asset) => asset.asset))

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
  const sorted = [...assets].sort((a, b) => bottom(a, imageOf) - bottom(b, imageOf))

  return (
    <Layer listening={editable}>
      {sorted.map((asset) => {
        const image = imageOf(asset.asset)
        const common = {
          id: asset.id,
          name: "asset",
          x: asset.x,
          y: asset.y,
          scaleX: asset.scaleX,
          scaleY: asset.scaleY,
          rotation: asset.rotation,
          draggable: editable,
          onPointerDown: (event: Konva.KonvaEventObject<PointerEvent>) => {
            if (event.evt.button === 0) onSelect(asset.id, event.evt.shiftKey)
          },
          onDragEnd: finish,
        }
        // Art that is not there (the file was removed) stays as a box, so it
        // can still be found and deleted.
        return image ? (
          <KonvaImage
            key={asset.id}
            {...common}
            image={image}
            width={image.naturalWidth}
            height={image.naturalHeight}
            offsetX={image.naturalWidth / 2}
            offsetY={image.naturalHeight / 2}
          />
        ) : (
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
      })}
    </Layer>
  )
}
