import type { MultiPolygon } from "polygon-clipping"
import { Shape } from "react-konva"
import { strokeCoast } from "@/lib/biomes/coast-tint"
import { BIOMES } from "@/lib/biomes/biomes"
import type { Surface } from "@/lib/biomes/surface"
import { mixRgb } from "@/lib/colour"
import type { Rgb } from "@/lib/colour"
import type { SceneBackground } from "@/lib/map-scene"
import { themeFor } from "@/lib/map-theme"

// How far either side of the coast the ground is read, in canvas pixels.
const REACH = 6

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
  const theme = themeFor(background)
  const plains = theme.ink
  const inks = BIOMES.map((biome) => theme.biomes[biome].ink)

  // The ground by the coast. The line is drawn on the rounded coast, which can lie
  // a little off the land that paint is allowed on, so the ground is also read a
  // little to either side and the side with the most paint is taken.
  const groundAt = (x: number, y: number, nx: number, ny: number) => {
    let best: number[] | null = null
    let most = 0
    for (const away of [0, REACH, -REACH]) {
      const weights = surface.weightsAt(x + nx * away, y + ny * away)
      const sum = weights?.reduce((total, weight) => total + weight, 0) ?? 0
      if (weights && sum > most) {
        best = weights
        most = sum
      }
    }
    return best
  }

  const inkAt = (x: number, y: number, nx: number, ny: number): Rgb => {
    const weights = groundAt(x, y, nx, ny)
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
