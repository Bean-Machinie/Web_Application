import { BIOMES } from "./biomes/biomes"
import type { Biome } from "./biomes/biomes"
import type { SceneBackground } from "./map-scene"
import { terrainTexture } from "./terrain-texture"
import { TILE_KINDS } from "./terrain-tiles"
import type { Tiles } from "./terrain-tiles"

// The painted ground of a map, laid out over its whole canvas from the tiles that
// exist: the sea, the land, and the ground of each biome. Anything without a tile
// is null, and keeps the look the code makes for it.
export type Terrain = {
  sea: HTMLCanvasElement | null
  land: HTMLCanvasElement | null
  biomes: Partial<Record<Biome, HTMLCanvasElement>>
  // How many pixels of each picture to a canvas pixel.
  scale: number
}

export const NO_TERRAIN: Terrain = { sea: null, land: null, biomes: {}, scale: 1 }

// The editor draws the ground on pictures of at most this many pixels, so a big
// canvas does not cost much memory. Publishing draws it again, larger.
const MAX_PIXELS = 5_000_000
export const editorScale = ({ width, height }: { width: number; height: number }) =>
  Math.min(1, Math.sqrt(MAX_PIXELS / (width * height)))

export function makeTerrain(
  tiles: Tiles,
  canvas: { width: number; height: number; seed: number },
  background: SceneBackground,
  scale: number
): Terrain {
  const make = (kind: (typeof TILE_KINDS)[number]) => {
    const tile = tiles[kind]
    return tile ? terrainTexture(tile, TILE_KINDS.indexOf(kind) + 1, canvas, background, scale) : null
  }
  const biomes: Terrain["biomes"] = {}
  for (const biome of BIOMES) {
    const texture = make(biome)
    if (texture) biomes[biome] = texture
  }
  return { sea: make("sea"), land: make("land"), biomes, scale }
}
