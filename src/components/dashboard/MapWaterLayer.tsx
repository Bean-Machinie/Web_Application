import type { MultiPolygon } from "polygon-clipping"
import { Image as KonvaImage } from "react-konva"
import type { BuilderView } from "@/hooks/use-builder-viewport"
import { useWaterImage } from "@/hooks/use-water-image"
import type { MapScene } from "@/lib/map-scene"
import type { MapStyle } from "@/lib/map-style"

type Props = {
  land: MultiPolygon
  style: MapStyle
  canvas: MapScene["canvas"]
  view: BuilderView
  size: { width: number; height: number }
}

// The sea around the land: a dark band along the coast and light wavy lines
// spreading out from it, over the painted sea and below the land. These are
// nodes of the surfaces layer.
export function MapWaterLayer({ land, style, canvas, view, size }: Props) {
  const water = useWaterImage(land, style, canvas, view, size)
  return water && <KonvaImage name="water" image={water.image} {...water.region} />
}
