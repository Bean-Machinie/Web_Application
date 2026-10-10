import { useEffect, useRef } from "react"
import type Konva from "konva"
import type { MultiPolygon } from "polygon-clipping"
import { Layer } from "react-konva"
import { useAssetInfos } from "@/hooks/use-asset-infos"
import { useAssetMovement } from "@/hooks/use-asset-movement"
import { useAssetPictures } from "@/hooks/use-asset-pictures"
import type { BuilderView } from "@/hooks/use-builder-viewport"
import type { Paint } from "@/lib/biomes/paint-tiles"
import type { Surface } from "@/lib/biomes/surface"
import type { Terrain } from "@/lib/terrain"
import type { AssetPatch } from "@/lib/map-asset-edit"
import type { MapScene, PlacedAsset } from "@/lib/map-scene"
import { AssetPictures } from "./AssetPictures"
import { MapSelectedAsset } from "./MapSelectedAsset"

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

// The placed art, above the land, drawn as pictures: the art is ink, and where
// it is solid the ground shows through it (see useAssetPictures). Only the
// selected pieces are shapes, which draw nothing and are there to be moved and
// scaled: a shape for every piece makes the layer slow to redraw. The rest are
// picked by place (see useAssetPick). A piece that is being moved draws itself,
// in flat colour, until it is let go (see useAssetMovement). The shapes are a layer
// of their own, so that moving one redraws only that, and not the big pictures
// under it.
export function MapAssetsLayer(props: Props) {
  const { assets, selected, editable, onSelect, canvas } = props
  const infoOf = useAssetInfos(assets.map((asset) => asset.asset))
  const { moving, picture, flatOf, handlers } = useAssetMovement({ ...props, infoOf })
  const { pictures, version } = useAssetPictures({ ...props, hidden: moving })
  // The pictures are redrawn in place, which no prop says, so the layer is told.
  const picturesLayer = useRef<Konva.Layer>(null)
  useEffect(() => {
    picturesLayer.current?.batchDraw()
  }, [version, pictures])

  return (
    <>
      <Layer ref={picturesLayer} name="assets-pictures" listening={false} visible={props.visible}>
        <AssetPictures overview={pictures.overview} canvas={canvas} sharp={pictures.view} />
      </Layer>
      <Layer listening={editable}>
        {assets
          .filter((asset) => selected.includes(asset.id))
          .map((asset) => (
            <MapSelectedAsset
              key={asset.id}
              asset={asset}
              info={infoOf(asset.asset)}
              draggable={editable && !props.altHeld}
              moving={moving.has(asset.id)}
              picture={picture}
              flatOf={flatOf}
              onSelect={(additive) => onSelect(asset.id, additive)}
              handlers={handlers}
            />
          ))}
      </Layer>
    </>
  )
}
