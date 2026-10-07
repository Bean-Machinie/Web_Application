import type { MultiPolygon } from "polygon-clipping"
import { Image as KonvaImage, Layer, Rect } from "react-konva"
import type { BuilderView } from "@/hooks/use-builder-viewport"
import { useTexture } from "@/hooks/use-texture"
import { useWaterImage } from "@/hooks/use-water-image"
import waterGrain from "@/assets/textures/water-grain.png"
import type { MapScene } from "@/lib/map-scene"
import type { MapStyle } from "@/lib/map-style"
import { themeFor } from "@/lib/map-theme"

type Props = {
  land: MultiPolygon
  style: MapStyle
  canvas: MapScene["canvas"]
  view: BuilderView
  size: { width: number; height: number }
}

// The sea around the land: a dark band along the coast and light wavy lines
// spreading out from it, with paper grain over the sea, below the land.
export function MapWaterLayer({ land, style, canvas, view, size }: Props) {
  const water = useWaterImage(land, style, canvas, view, size)
  // Tiles are mid-grey, so overlay leaves the colours as they are and only adds
  // the grain.
  const grain = useTexture(waterGrain)
  const grainAmount = themeFor(canvas.background).water.grain
  return (
    <>
      <Layer listening={false}>
        {water && <KonvaImage name="water" image={water.image} {...water.region} />}
      </Layer>
      {grain && (
        <Layer listening={false} globalCompositeOperation="overlay" opacity={grainAmount}>
          <Rect
            width={canvas.width}
            height={canvas.height}
            fillPatternImage={grain}
            fillPatternRepeat="repeat"
          />
        </Layer>
      )}
    </>
  )
}
