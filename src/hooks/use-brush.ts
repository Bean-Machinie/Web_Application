import { useState } from "react"
import { BLEND_STRENGTH, BLEND_STRETCH, BRUSH_OPACITY, BRUSH_SIZE } from "@/lib/biomes/biomes"
import type { BrushBiome } from "@/lib/biomes/biomes"
import { DETAIL_SIZE } from "@/lib/details/details"
import type { DetailBrush } from "@/lib/details/details"
import type { BuilderTool } from "@/lib/map-builder-tools"

// What the brush paints on: the biomes, or the details over them.
export type BrushLayer = "biomes" | "details"

export type Brush = {
  layer: BrushLayer
  biome: BrushBiome
  detail: DetailBrush
  // Across the brush, in canvas pixels. Each layer keeps its own.
  size: number
  // The least and most it can be, for the layer in use.
  range: { min: number; max: number }
  // How much of a biome a stroke lays down at most, 0 to 1.
  opacity: number
  // How strongly the blend brush softens, 0 to 1.
  strength: number
  // How much of what it has picked up the blend brush pulls along, 0 to 1.
  stretch: number
  onLayer: (layer: BrushLayer) => void
  onBiome: (biome: BrushBiome) => void
  onDetail: (detail: DetailBrush) => void
  onSize: (size: number) => void
  onOpacity: (opacity: number) => void
  onStrength: (strength: number) => void
  onStretch: (stretch: number) => void
  // One step larger (up) or smaller, as the size keys do.
  stepSize: (up: boolean) => void
}

const clamp = (size: number, { min, max }: { min: number; max: number }) =>
  Math.round(Math.min(Math.max(size, min), max))

// What the brush paints, how big it is and how strongly it blends. These belong
// to the editor, not to the map. The blend tool works on the biomes only, so
// with it the brush is the biome one whatever tab was last open.
export function useBrush(tool: BuilderTool): Brush {
  const [picked, onLayer] = useState<BrushLayer>("biomes")
  const [biome, onBiome] = useState<BrushBiome>("desert")
  const [detail, onDetail] = useState<DetailBrush>("path")
  const [biomeSize, setBiomeSize] = useState(BRUSH_SIZE.start)
  const [detailSize, setDetailSize] = useState(DETAIL_SIZE.start)
  const [opacity, onOpacity] = useState(BRUSH_OPACITY.start)
  const [strength, onStrength] = useState(BLEND_STRENGTH.start)
  const [stretch, onStretch] = useState(BLEND_STRETCH.start)

  const layer = tool === "blend" ? "biomes" : picked
  const details = layer === "details"
  const range = details ? DETAIL_SIZE : BRUSH_SIZE
  const setSize = details ? setDetailSize : setBiomeSize
  // A step is at least one pixel, which a small brush would otherwise never take.
  const step = (now: number, up: boolean) =>
    up ? Math.max(now * range.step, now + 1) : Math.min(now / range.step, now - 1)

  return {
    layer,
    biome,
    detail,
    size: details ? detailSize : biomeSize,
    range,
    opacity,
    strength,
    stretch,
    onLayer,
    onBiome,
    onDetail,
    onSize: (next) => setSize(clamp(next, range)),
    onOpacity,
    onStrength,
    onStretch,
    stepSize: (up) => setSize((now) => clamp(step(now, up), range)),
  }
}
