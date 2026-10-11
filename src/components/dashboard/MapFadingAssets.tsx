import { Shape } from "react-konva"
import type { AssetInfo } from "@/lib/map-assets"
import type { PlacedAsset } from "@/lib/map-scene"

// How much of itself art that the eraser has touched still shows.
const FADE = 0.3

type Props = {
  assets: PlacedAsset[]
  fading: ReadonlySet<string>
  infoOf: (id: string) => AssetInfo | undefined
  // The art in flat colour where it stands, as the pieces being moved are drawn.
  flatOf: (now: PlacedAsset, info: AssetInfo) => HTMLCanvasElement
}

// The art the eraser has touched, drawn faint where it stands, until it is let go:
// the pictures leave it out (see MapAssetsLayer).
export function MapFadingAssets({ assets, fading, infoOf, flatOf }: Props) {
  return assets
    .filter((asset) => fading.has(asset.id))
    .map((asset) => {
      const info = infoOf(asset.asset)
      if (!info) return null
      const { trim } = info
      return (
        <Shape
          key={asset.id}
          listening={false}
          opacity={FADE}
          x={asset.x}
          y={asset.y}
          scaleX={asset.scaleX}
          scaleY={asset.scaleY}
          rotation={asset.rotation}
          width={trim.width}
          height={trim.height}
          offsetX={trim.width / 2}
          offsetY={trim.height / 2}
          sceneFunc={(context) => context.drawImage(flatOf(asset, info), 0, 0, trim.width, trim.height)}
        />
      )
    })
}
