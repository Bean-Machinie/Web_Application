import type { WorldEntry } from "./world-entries"

// The picture of the map builder for its card, if the file has been put in place;
// null until then. Looked up with a glob so a missing file is no build error.
const found = import.meta.glob<string>("/src/assets/tools/map-builder.png", {
  eager: true,
  query: "?url",
  import: "default",
})

export const MAP_BUILDER_IMAGE: string | null = Object.values(found)[0] ?? null

// Until the builder has a picture of its own, the newest map that has one.
export function mapToolImage(entries: WorldEntry[] | null) {
  if (MAP_BUILDER_IMAGE) return MAP_BUILDER_IMAGE
  const withImage = (entries ?? []).filter((entry) => entry.kind === "map" && entry.imageUrl)
  withImage.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
  return withImage[0]?.imageUrl ?? null
}


// An NPC portrait of the starter village, until the creator has a picture of its own.
export const CHARACTER_CREATOR_IMAGE = "/templates/starter-village/captain-mara-dorn.webp"

// A picture for each kind of entry on its card, from the starter village's portraits. A kind
// without one shows its icon.
export const ENTRY_KIND_IMAGES: Partial<Record<string, string>> = {
  npc: "/templates/starter-village/elder-osric.webp",
  creature: "/templates/starter-village/wolf.webp",
  location: "/templates/starter-village/willowbrook.webp",
  item: "/templates/starter-village/old-map.webp",
  // No book or scroll picture exists yet; the item's stands in.
  lore: "/templates/starter-village/old-map.webp",
}
