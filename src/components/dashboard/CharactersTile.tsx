import { useMemo } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import type { CharacterCardData } from "@/hooks/use-character-cards"
import { characterSubtitle } from "@/lib/character-summary"
import { characterPath, characterStartPath } from "@/lib/characters"
import { reelCards } from "@/lib/character-reel-cards"
import { BentoTile } from "./BentoTile"
import { CharacterReel } from "./CharacterReel"
import { HomeCardBody } from "./HomeCardBody"
import { TileLink } from "./TileLink"

// Newest first, as the characters are ordered.
type Props = { cards: CharacterCardData[]; onCreate: () => void }

// Your characters (and the starter village's people) as cards on a slanted reel rising from under the
// text, with the latest character, a way to make another and to see them all; for someone with none
// yet, Start.
export function CharactersTile({ cards, onCreate }: Props) {
  const latest = cards[0]
  const reel = useMemo(() => reelCards(cards), [cards])
  const art = <CharacterReel cards={reel} />

  if (!latest) {
    return (
      <BentoTile area="characters" wide artAcross bottomShade art={art}>
        <HomeCardBody title="Create a character" line="Choose a species, class and background. It only takes a few minutes." actions={<Button onClick={onCreate}>Start</Button>} />
      </BentoTile>
    )
  }

  const { character, summary } = latest
  return (
    <BentoTile area="characters" wide artAcross bottomShade art={art}>
      <HomeCardBody
        title={
          <Link to={character.draft ? characterStartPath(character.id) : characterPath(character.id)} className="focus-visible:ring-ring rounded-sm outline-none hover:underline focus-visible:ring-2">
            {character.name}
          </Link>
        }
        line={characterSubtitle(character, summary)}
        actions={
          <>
            <Button onClick={onCreate}>
              Create character
            </Button>
            <TileLink to="/app/characters">All characters</TileLink>
          </>
        }
      />
    </BentoTile>
  )
}
