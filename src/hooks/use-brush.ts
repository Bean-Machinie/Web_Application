import { useEffect, useState } from "react"
import { BLEND_STRENGTH, BLEND_STRETCH, BRUSH_OPACITY, BRUSH_SIZE } from "@/lib/biomes/biomes"
import type { BrushBiome } from "@/lib/biomes/biomes"

export type Brush = {
  biome: BrushBiome
  // Across the brush, in canvas pixels.
  size: number
  // How much of a biome a stroke lays down at most, 0 to 1.
  opacity: number
  // How strongly the blend brush softens, 0 to 1.
  strength: number
  // How much of what it has picked up the blend brush pulls along, 0 to 1.
  stretch: number
  onBiome: (biome: BrushBiome) => void
  onSize: (size: number) => void
  onOpacity: (opacity: number) => void
  onStrength: (strength: number) => void
  onStretch: (stretch: number) => void
}

const clamp = (size: number) => Math.round(Math.min(Math.max(size, BRUSH_SIZE.min), BRUSH_SIZE.max))

// What the brush paints, how big it is and how strongly it blends, with [ and ]
// changing the size while the brush or the blend brush is the tool. These belong to the editor, not to the map.
export function useBrush(enabled: boolean): Brush {
  const [biome, onBiome] = useState<BrushBiome>("desert")
  const [size, onSize] = useState(BRUSH_SIZE.start)
  const [opacity, onOpacity] = useState(BRUSH_OPACITY.start)
  const [strength, onStrength] = useState(BLEND_STRENGTH.start)
  const [stretch, onStretch] = useState(BLEND_STRETCH.start)

  useEffect(() => {
    if (!enabled) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "[" && event.key !== "]") return
      if (event.ctrlKey || event.metaKey || event.altKey) return
      const target = event.target
      if (target instanceof Element && target.closest("input, textarea, [contenteditable=true]")) return
      event.preventDefault()
      onSize((now) => clamp(event.key === "]" ? now * BRUSH_SIZE.step : now / BRUSH_SIZE.step))
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [enabled])

  return {
    biome,
    size,
    opacity,
    strength,
    stretch,
    onBiome,
    onSize: (next) => onSize(clamp(next)),
    onOpacity,
    onStrength,
    onStretch,
  }
}
