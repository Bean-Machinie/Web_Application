import { useMemo } from "react"
import { ENTRY_KIND_IMAGES } from "@/lib/tool-images"
import type { WorldEntry } from "@/lib/world-entries"
import { BentoTile } from "./BentoTile"
import { HomeCardBody } from "./HomeCardBody"
import { TileLink } from "./TileLink"

// The Compendium tile, the way into the SRD's creatures, with the first creature of the library that has
// a picture, or the Wolf.
export function CompendiumTile({ entries }: { entries: WorldEntry[] | null }) {
  const image = useMemo(() => (entries ?? []).find((entry) => entry.kind === "creature" && entry.imageUrl)?.imageUrl ?? ENTRY_KIND_IMAGES.creature, [entries])

  return (
    <BentoTile art={image && <img src={image} alt="" className="absolute inset-0 size-full object-cover" />}>
      <HomeCardBody title="Compendium" line="Creatures, spells and rules of the SRD." actions={<TileLink to="/app/compendium">Browse creatures</TileLink>} />
    </BentoTile>
  )
}
