// The art that can be placed on a map: every image in
// src/assets/map-assets/<category>/. Dropping a file in a category folder adds
// it to the library, with no list to keep. A file's path under map-assets is
// its id in saved scenes, so a file must not be renamed or moved once maps use
// it.
export type MapAsset = { id: string; category: string; name: string; url: string }

const FILES = import.meta.glob<string>("/src/assets/map-assets/*/*.{svg,png,webp,jpg,jpeg}", {
  eager: true,
  query: "?url",
  import: "default",
})

const words = (file: string) =>
  file
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase())

export const MAP_ASSETS: MapAsset[] = Object.entries(FILES)
  .map(([path, url]) => {
    const id = path.split("/map-assets/")[1]
    const [category, file] = id.split("/")
    return { id, category, name: words(file), url }
  })
  .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))

export const ASSET_CATEGORIES = [...new Set(MAP_ASSETS.map((asset) => asset.category))]

const BY_ID = new Map(MAP_ASSETS.map((asset) => [asset.id, asset]))
export const assetById = (id: string) => BY_ID.get(id)

export const categoryLabel = (category: string) => words(category)

// How wide an asset is when first placed, in canvas pixels, by category. The
// canvas is a few thousand pixels wide. Categories not listed get the fallback.
const DEFAULT_WIDTH: Record<string, number> = {
  mountains: 220,
  forests: 180,
  towns: 170,
}
const FALLBACK_WIDTH = 160
export const defaultWidth = (category: string) => DEFAULT_WIDTH[category] ?? FALLBACK_WIDTH

// Images are loaded once and kept, so placing and drawing never wait twice.
const loading = new Map<string, Promise<HTMLImageElement | null>>()
const loaded = new Map<string, HTMLImageElement>()

export function loadAssetImage(id: string) {
  const known = loading.get(id)
  if (known) return known
  const asset = assetById(id)
  const promise = new Promise<HTMLImageElement | null>((resolve) => {
    if (!asset) return resolve(null)
    const image = new Image()
    image.onload = () => {
      loaded.set(id, image)
      resolve(image)
    }
    image.onerror = () => resolve(null)
    image.src = asset.url
  })
  loading.set(id, promise)
  return promise
}

export const loadedAssetImage = (id: string) => loaded.get(id)
