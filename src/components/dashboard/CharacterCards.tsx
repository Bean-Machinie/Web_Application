import { useCampaign } from "./useCampaign"
import { CharacterCard } from "./CharacterCard"
import type { CharacterCardData } from "@/hooks/use-character-cards"

// Character cards that know the names of the campaigns they are in.
export function CharacterCards({ items, className }: { items: CharacterCardData[]; className?: string }) {
  const { campaigns } = useCampaign()
  const nameOf = (id: string | null) => campaigns.find((campaign) => campaign.id === id)?.name ?? null

  return (
    <>
      {items.map(({ character, summary }) => (
        <div key={character.id} className={className}>
          <CharacterCard character={character} summary={summary} campaignName={nameOf(character.campaignId)} />
        </div>
      ))}
    </>
  )
}
