import { BentoTile } from "./BentoTile"
import { HomeCardBody } from "./HomeCardBody"
import { TileLink } from "./TileLink"

// The Compendium tile, the way into the SRD's creatures.
export function CompendiumTile() {
  return (
    <BentoTile>
      <HomeCardBody title="Compendium" line="Creatures, spells and rules of the SRD." actions={<TileLink to="/app/compendium">Browse creatures</TileLink>} />
    </BentoTile>
  )
}
