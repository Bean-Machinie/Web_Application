import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import type { CharacterCardData } from "@/hooks/use-character-cards"
import { characterSubtitle } from "@/lib/character-summary"
import { characterPath, characterStartPath } from "@/lib/characters"
import { CHARACTER_CREATOR_IMAGE } from "@/lib/tool-images"
import { BentoTile } from "./BentoTile"
import { HeroButton } from "./HeroButton"
import { HomeCardBody } from "./HomeCardBody"
import { PixelatedPortrait } from "./PixelatedPortrait"
import { TileLink } from "./TileLink"

// Newest first, as the characters are ordered.
type Props = { cards: CharacterCardData[]; onCreate: () => void }

// The latest character in coarse pixels that sharpen as the tile is pointed at, with a way to make
// another and to see them all; for someone with none yet, the creator's picture and Start.
export function CharactersTile({ cards, onCreate }: Props) {
  const latest = cards[0]
  const art = <PixelatedPortrait src={latest?.character.portrait?.url ?? CHARACTER_CREATOR_IMAGE} className="absolute inset-0 size-full" />

  if (!latest) {
    return (
      <BentoTile art={art} artClassName="w-3/5">
        <HomeCardBody title="Create a character" line="Choose a species, class and background. It only takes a few minutes." actions={<HeroButton onClick={onCreate}>Start</HeroButton>} />
      </BentoTile>
    )
  }

  const { character, summary } = latest
  return (
    <BentoTile art={art} artClassName="w-3/5">
      <HomeCardBody
        title={
          <Link to={character.draft ? characterStartPath(character.id) : characterPath(character.id)} className="focus-visible:ring-ring rounded-sm outline-none hover:underline focus-visible:ring-2">
            {character.name}
          </Link>
        }
        line={characterSubtitle(character, summary)}
        actions={
          <>
            <Button size="lg" onClick={onCreate}>
              Create character
            </Button>
            <TileLink to="/app/characters">All characters</TileLink>
          </>
        }
      />
    </BentoTile>
  )
}
