import type { MultiPolygon } from "polygon-clipping"
import { Image as KonvaImage, Rect } from "react-konva"
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
  // The sea is a painted tile, which is used as painted, so it has no grain over it.
  painted: boolean
}

// The sea around the land: a dark band along the coast and light wavy lines
// spreading out from it, with paper grain over the sea, below the land. These
// are nodes of the surfaces layer.
export function MapWaterLayer({ land, style, canvas, view, size, painted }: Props) {
  const water = useWaterImage(land, style, canvas, view, size)
  // The grain is laid over the sea as a plain film at the theme's strength, as it
  // always was: it had a layer of its own, and a layer's blend never reached the
  // sea below it, only its opacity did.
  const grain = useTexture(waterGrain)
  const grainAmount = themeFor(canvas.background).water.grain
  return (
    <>
      {water && <KonvaImage name="water" image={water.image} {...water.region} />}
      {grain && !painted && (
        <Rect
          width={canvas.width}
          height={canvas.height}
          fillPatternImage={grain}
          fillPatternRepeat="repeat"
          opacity={grainAmount}
        />
      )}
    </>
  )
}
