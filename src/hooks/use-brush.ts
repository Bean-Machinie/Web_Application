import { useEffect, useState } from "react"
import { BRUSH_SIZE } from "@/lib/biomes/biomes"
import type { BrushBiome } from "@/lib/biomes/biomes"

export type Brush = {
  biome: BrushBiome
  // Across the brush, in canvas pixels.
  size: number
  onBiome: (biome: BrushBiome) => void
  onSize: (size: number) => void
}

const clamp = (size: number) => Math.round(Math.min(Math.max(size, BRUSH_SIZE.min), BRUSH_SIZE.max))

// What the brush paints and how big it is, which [ and ] change while the brush
// is the tool. These belong to the editor, not to the map.
export function useBrush(enabled: boolean): Brush {
  const [biome, onBiome] = useState<BrushBiome>("desert")
  const [size, onSize] = useState(BRUSH_SIZE.start)

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

  return { biome, size, onBiome, onSize: (next) => onSize(clamp(next)) }
}
