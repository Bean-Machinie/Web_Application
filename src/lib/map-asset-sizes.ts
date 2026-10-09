import sizesFile from "../assets/map-assets/sizes.json"

// The sizes set by hand for single pieces of art (src/assets/map-assets/sizes.json), by
// the art's id. They are read once, and replaced as the dev server says they change
// (see saveOwnSize), so that a change shows at once, with no reload.
let table: Record<string, number> = { ...(sizesFile as Record<string, number>) }
const watchers = new Set<() => void>()

export const ownSizeOf = (assetId: string): number | undefined => table[assetId]
export const getSizes = () => table

export function subscribeSizes(watcher: () => void) {
  watchers.add(watcher)
  return () => {
    watchers.delete(watcher)
  }
}

function replaceSizes(next: Record<string, number>) {
  table = next
  watchers.forEach((watcher) => watcher())
}

// Development only: sets (or, with null, removes) a piece of art's own size in
// sizes.json through the dev server, and takes the whole table from its reply.
export async function saveOwnSize(assetId: string, size: number | null) {
  const response = await fetch("/__dev/asset-size", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: assetId, size }),
  })
  const reply = (await response.json().catch(() => null)) as { sizes?: Record<string, number>; error?: string } | null
  if (!response.ok || !reply?.sizes) throw new Error(reply?.error ?? "The dev server did not save the size.")
  replaceSizes(reply.sizes)
}
