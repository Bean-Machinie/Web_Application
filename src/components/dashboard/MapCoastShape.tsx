import type { MultiPolygon } from "polygon-clipping"
import { Shape } from "react-konva"
import { strokeCoast } from "@/lib/biomes/coast-tint"
import { biomeInks, hexToRgb, mixRgb } from "@/lib/biomes/palette"
import type { Rgb } from "@/lib/biomes/palette"
import type { Surface } from "@/lib/biomes/surface"
import { LAND_COLOURS } from "@/lib/map-land-colours"
import type { SceneBackground } from "@/lib/map-scene"

type Props = {
  land: MultiPolygon
  canvas: { width: number; height: number }
  background: SceneBackground
  outline: number
  surface: Surface
}

// The ink line along the coast, in the colour of the ground beside it, blended
// where the ground changes. All of it is drawn by this one shape.
export function MapCoastShape({ land, canvas, background, outline, surface }: Props) {
  const plains = hexToRgb(LAND_COLOURS[background].ink)
  const inks = biomeInks(background)

  const inkAt = (x: number, y: number): Rgb => {
    const weights = surface.weightsAt(x, y)
    if (!weights) return plains
    // What no biome covers is plains.
    let used = Math.max(1 - weights.reduce((sum, weight) => sum + weight, 0), 0)
    let ink = plains
    weights.forEach((weight, biome) => {
      if (weight <= 0) return
      used += weight
      // Each biome pulls the ink toward its own by its share of what is left.
      ink = mixRgb(ink, inks[biome], weight / used)
    })
    return ink
  }

  return (
    <Shape
      sceneFunc={(context) => {
        if (land.length === 0 || outline <= 0) return
        context.setAttr("lineWidth", outline)
        context.setAttr("lineCap", "round")
        context.setAttr("lineJoin", "round")
        strokeCoast(context, land, canvas, surface.state.touched ? inkAt : () => plains)
      }}
    />
  )
}
