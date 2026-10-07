import { BIOMES } from "./biomes/biomes"
import type { Biome } from "./biomes/biomes"
import type { SceneBackground } from "./map-scene"
import { terrainTexture } from "./terrain-texture"
import { TILE_KINDS } from "./terrain-tiles"
import type { TileKind, Tiles } from "./terrain-tiles"

// The painted ground of a map, laid out over its whole canvas from the tiles that
// are: the sea, the land, and the ground of each biome.
export type Terrain = {
  sea: HTMLCanvasElement
  land: HTMLCanvasElement
  biomes: Record<Biome, HTMLCanvasElement>
  // How many pixels of each picture to a canvas pixel.
  scale: number
}

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
  const make = (kind: TileKind) =>
    terrainTexture(tiles[kind], TILE_KINDS.indexOf(kind) + 1, canvas, background, scale)
  const biomes = Object.fromEntries(BIOMES.map((biome) => [biome, make(biome)])) as Terrain["biomes"]
  return { sea: make("sea"), land: make("land"), biomes, scale }
}
