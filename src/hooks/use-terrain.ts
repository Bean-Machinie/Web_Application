import { useEffect, useMemo, useState } from "react"
import type { MapScene } from "@/lib/map-scene"
import { NO_TERRAIN, editorScale, makeTerrain } from "@/lib/terrain"
import { loadTiles } from "@/lib/terrain-tiles"
import type { Tiles } from "@/lib/terrain-tiles"

// The painted ground for the canvas, as soon as its tiles have loaded; until
// then, and for any ground with no tile, nothing, so the generated look shows.
export function useTerrain({ width, height, background, seed }: MapScene["canvas"]) {
  const [tiles, setTiles] = useState<Tiles>({})
  useEffect(() => {
    let current = true
    void loadTiles().then((loaded) => current && setTiles(loaded))
    return () => {
      current = false
    }
  }, [])

  return useMemo(
    () =>
      Object.keys(tiles).length === 0
        ? NO_TERRAIN
        : makeTerrain(tiles, { width, height, seed }, background, editorScale({ width, height })),
    [tiles, width, height, background, seed]
  )
}
