import type { CharacterCardData } from "@/hooks/use-character-cards"
import type { Campaign } from "@/lib/campaigns"
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
  onNewCharacter: () => void
}

// The top of Home as a grid of tiles, three columns wide and three rows high, small enough to sit on one
// screen; the wide tiles take two columns, so the order here is what lays them out.
export function HomeBento({ campaign, openedAt, cards, onNewCharacter }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:grid-rows-[260px_200px_200px]">
      <ContinueTile campaign={campaign} openedAt={openedAt} />
      <CharactersTile cards={cards} onCreate={onNewCharacter} />
      <CompendiumTile />
      <MapMakerTile />
      <WorldEntryTile />
      <NewCampaignTile returning={campaign !== null} />
    </div>
  )
}
