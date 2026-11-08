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

// The top of Home as a grid of tiles, three columns wide and three rows high, sharing the height it is
// given (the first row a little taller) but no tile under 180px; the wide tiles take two columns, so the
// order here is what lays them out.
export function HomeBento({ campaign, openedAt, cards, entries, onNewCharacter }: Props) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="grid grid-cols-1 gap-3 md:h-full md:grid-cols-3 md:grid-rows-[minmax(180px,1.3fr)_minmax(180px,1fr)_minmax(180px,1fr)]">
        <ContinueTile campaign={campaign} openedAt={openedAt} />
        <CharactersTile cards={cards} onCreate={onNewCharacter} />
        <CompendiumTile entries={entries} />
        <MapMakerTile entries={entries} />
        <WorldEntryTile entries={entries} />
        <NewCampaignTile returning={campaign !== null} />
      </div>
    </MotionConfig>
  )
}
