import { MotionConfig } from "motion/react"
import type { CharacterCardData } from "@/hooks/use-character-cards"
import type { Campaign } from "@/lib/campaigns"
import type { WorldEntry } from "@/lib/world-entries"
import { CharactersTile } from "./CharactersTile"
import { CompendiumTile } from "./CompendiumTile"
import { ContinueTile } from "./ContinueTile"
import { MapMakerTile } from "./MapMakerTile"
import { NewCampaignTile } from "./NewCampaignTile"
import { WorldEntryTile } from "./WorldEntryTile"

type Props = {
  // The campaign to go back to; null for a new player.
  campaign: Campaign | null
  openedAt: number | null
  cards: CharacterCardData[]
  // The library's entries, for the tiles' pictures.
  entries: WorldEntry[] | null
  onNewCharacter: () => void
}

// The top of Home as a grid of square cells, three by three, each as high as a third of the height it
// has (--bento-h, set by HomePage); the wide tiles take two cells of a row, as the areas below place them.
// Narrower, the columns share the width and the square tiles set the rows' height; on a phone it is one column.
export function HomeBento({ campaign, openedAt, cards, entries, onNewCharacter }: Props) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:[grid-template-areas:'lead_lead_map'_'compendium_characters_characters'_'world_world_play'] lg:grid-cols-[repeat(3,var(--bento-h))] lg:grid-rows-[repeat(3,var(--bento-h))]">
        {/* First the way back into your campaign; for someone with none, starting one, with joining one
            further down where starting one sits once you play. */}
        {campaign ? <ContinueTile area="lead" campaign={campaign} openedAt={openedAt} /> : <NewCampaignTile area="lead" campaign={null} />}
        <MapMakerTile entries={entries} />
        <CompendiumTile />
        <CharactersTile cards={cards} entries={entries} onCreate={onNewCharacter} />
        <WorldEntryTile cards={cards} />
        {campaign ? <NewCampaignTile area="play" square campaign={campaign} /> : <ContinueTile area="play" square campaign={null} openedAt={null} />}
      </div>
    </MotionConfig>
  )
}
