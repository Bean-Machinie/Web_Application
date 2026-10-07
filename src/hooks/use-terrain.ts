import { useEffect, useMemo, useState } from "react"
import type { MapScene } from "@/lib/map-scene"
import { editorScale, makeTerrain } from "@/lib/terrain"
import { loadTiles } from "@/lib/terrain-tiles"
import type { Tiles } from "@/lib/terrain-tiles"

// The painted ground for the canvas; null until its tiles have loaded, so that
// the map is not drawn at all before it can be drawn with its real ground.
export function useTerrain({ width, height, background, seed }: MapScene["canvas"]) {
  const [tiles, setTiles] = useState<Tiles | null>(null)
  const [, fail] = useState()
  useEffect(() => {
    let current = true
    loadTiles().then(
      (loaded) => current && setTiles(loaded),
      // Thrown while rendering, where an error boundary can see it.
      (error) =>
        fail(() => {
          throw error
        })
    )
    return () => {
      current = false
    }
  }, [])

  return useMemo(
    () => tiles && makeTerrain(tiles, { width, height, seed }, background, editorScale({ width, height })),
    [tiles, width, height, background, seed]
  )
}
