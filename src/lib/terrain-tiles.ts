import { BIOMES } from "./biomes/biomes"
import type { Biome } from "./biomes/biomes"

// The painted ground tiles in src/assets/textures/, by what they are the ground
// of: land.png, sea.png, and ice.png, swamp.png, desert.png, volcanic.png for
// the biomes (png, webp or jpg). A tile that is not there is not an error: that
// ground keeps the look the code makes for it.
export type TileKind = "land" | "sea" | Biome
export const TILE_KINDS: TileKind[] = ["land", "sea", ...BIOMES]

const FILES = import.meta.glob<string>("/src/assets/textures/*.{png,webp,jpg,jpeg}", {
  eager: true,
  query: "?url",
  import: "default",
})

const URLS = new Map<TileKind, string>()
for (const [path, url] of Object.entries(FILES)) {
  const name = path.split("/").pop()!.replace(/\.[^.]+$/, "")
  if ((TILE_KINDS as string[]).includes(name)) URLS.set(name as TileKind, url)
}

export type Tiles = Partial<Record<TileKind, HTMLImageElement>>

let loading: Promise<Tiles> | null = null

// Every tile that exists, loaded once and kept.
export function loadTiles(): Promise<Tiles> {
  loading ??= Promise.all(
    [...URLS].map(
      ([kind, url]) =>
        new Promise<[TileKind, HTMLImageElement | null]>((resolve) => {
          const image = new Image()
          image.onload = () => resolve([kind, image])
          image.onerror = () => resolve([kind, null])
          image.src = url
        })
    )
  ).then((loaded) => {
    const tiles: Tiles = {}
    for (const [kind, image] of loaded) if (image) tiles[kind] = image
    return tiles
  })
  return loading
}
