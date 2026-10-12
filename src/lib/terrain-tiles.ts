import { BIOMES } from "./biomes/biomes"
import type { Biome } from "./biomes/biomes"

// The painted ground tiles in src/assets/textures/, by what they are the ground
// of: land.png, sea.png, and ice.png, swamp.png, desert.png, volcanic.png for
// the biomes, and path.png and gravel.png for the detail brush (png, webp or jpg). All of
// them must be there.
export type TileKind = "land" | "sea" | Biome
export const TILE_KINDS: TileKind[] = ["land", "sea", ...BIOMES]

const FILES = import.meta.glob<string>("/src/assets/textures/*.{png,webp,jpg,jpeg}", {
  eager: true,
  query: "?url",
  import: "default",
})

const URLS = new Map<string, string>()
for (const [path, url] of Object.entries(FILES)) URLS.set(path.split("/").pop()!.replace(/\.[^.]+$/, ""), url)

// The ground of the path and the gravel (path.png, gravel.png), kept apart from the land's tiles
// since the terrain is not made of them. Filled by loadTiles.
export const DETAIL_GROUNDS = ["path", "gravel"] as const
export const detailGrounds = new Map<string, HTMLImageElement>()

export const tileUrl = (kind: TileKind) => URLS.get(kind)

export type Tiles = Record<TileKind, HTMLImageElement>

let loading: Promise<Tiles> | null = null

function loadTile<Kind extends string>(kind: Kind) {
  const url = URLS.get(kind)
  return new Promise<[Kind, HTMLImageElement]>((resolve, reject) => {
    if (!url) return reject(new Error(`Missing ground tile: src/assets/textures/${kind}.png`))
    const image = new Image()
    // Decoded before it is resolved, so drawing it later does not stall.
    image.onload = () => void image.decode().then(() => resolve([kind, image]), reject)
    image.onerror = () => reject(new Error(`Could not load the ground tile ${kind}`))
    image.src = url
  })
}

// Every tile, loaded once and kept.
export function loadTiles(): Promise<Tiles> {
  loading ??= Promise.all([...TILE_KINDS.map(loadTile), ...DETAIL_GROUNDS.map(loadTile)]).then((loaded) => {
    for (const [name, image] of loaded.slice(TILE_KINDS.length)) detailGrounds.set(name, image)
    return Object.fromEntries(loaded.slice(0, TILE_KINDS.length)) as Tiles
  })
  return loading
}
