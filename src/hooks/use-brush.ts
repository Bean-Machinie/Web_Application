import { useState } from "react"
import { BLEND_STRENGTH, BLEND_STRETCH, BRUSH_OPACITY, BRUSH_SIZE } from "@/lib/biomes/biomes"
import type { BrushBiome } from "@/lib/biomes/biomes"
import { DETAIL_SIZE } from "@/lib/details/details"
import type { Detail } from "@/lib/details/details"
import { ERASE_SIZE } from "@/lib/erase"
import type { EraseTarget } from "@/lib/erase"
import type { BuilderTool } from "@/lib/map-builder-tools"

// What the brush paints on: the biomes, or the details over them.
export type BrushLayer = "biomes" | "details"

// Each size that is kept: for the two brush tabs, and for each of the eraser's.
type SizeKey = BrushLayer | `erase-${EraseTarget}`
const RANGES: Record<SizeKey, { min: number; max: number; start: number; step: number }> = {
  biomes: BRUSH_SIZE,
  details: DETAIL_SIZE,
  "erase-biomes": ERASE_SIZE.biomes,
  "erase-details": ERASE_SIZE.details,
  "erase-assets": ERASE_SIZE.assets,
}

export type Brush = {
  layer: BrushLayer
  biome: BrushBiome
  detail: Detail
  // What the eraser takes away.
  erase: EraseTarget
  // Across the brush, in canvas pixels. Each layer and each eraser keeps its own.
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
  onDetail: (detail: Detail) => void
  onErase: (erase: EraseTarget) => void
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
  const [detail, onDetail] = useState<Detail>("path")
  const [erase, onErase] = useState<EraseTarget>("biomes")
  const [sizes, setSizes] = useState(
    () => Object.fromEntries(Object.entries(RANGES).map(([key, { start }]) => [key, start])) as Record<SizeKey, number>
  )
  const [opacity, onOpacity] = useState(BRUSH_OPACITY.start)
  const [strength, onStrength] = useState(BLEND_STRENGTH.start)
  const [stretch, onStretch] = useState(BLEND_STRETCH.start)

  const layer = tool === "blend" ? "biomes" : picked
  const key: SizeKey = tool === "eraser" ? `erase-${erase}` : layer
  const range = RANGES[key]
  const setSize = (next: (now: number) => number) => setSizes((now) => ({ ...now, [key]: next(now[key]) }))
  // A step is at least one pixel, which a small brush would otherwise never take.
  const step = (now: number, up: boolean) =>
    up ? Math.max(now * range.step, now + 1) : Math.min(now / range.step, now - 1)

  return {
    layer,
    biome,
    detail,
    erase,
    size: sizes[key],
    range,
    opacity,
    strength,
    stretch,
    onLayer,
    onBiome,
    onDetail,
    onErase,
    onSize: (next) => setSize(() => clamp(next, range)),
    onOpacity,
    onStrength,
    onStretch,
    stepSize: (up) => setSize((now) => clamp(step(now, up), range)),
  }
}
