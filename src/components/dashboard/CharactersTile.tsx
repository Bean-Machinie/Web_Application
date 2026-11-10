import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import type { CharacterCardData } from "@/hooks/use-character-cards"
import { characterSubtitle } from "@/lib/character-summary"
import { characterPath, characterStartPath } from "@/lib/characters"
import { ENTRY_KIND_IMAGES } from "@/lib/tool-images"
import type { WorldEntry } from "@/lib/world-entries"
import { BentoTile } from "./BentoTile"
import { HomeCardBody } from "./HomeCardBody"
import { ImageParticles } from "./ImageParticles"
import { TileLink } from "./TileLink"

// Newest first, as the characters are ordered; the entries give the tile's pictures.
type Props = { cards: CharacterCardData[]; entries: WorldEntry[] | null; onCreate: () => void }

// Pictures shown in turn, newest first.
const SHOWN = 12

// The pictures of the library's newest entries (not maps); the starter village's when it has none.
function picturesOf(entries: WorldEntry[] | null) {
  const newest = [...(entries ?? [])].filter((entry) => entry.kind !== "map" && entry.imageUrl).sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
  const pictures = newest.slice(0, SHOWN).map((entry) => entry.imageUrl!)
  return pictures.length > 0 ? pictures : [ENTRY_KIND_IMAGES.location, ENTRY_KIND_IMAGES.npc, ENTRY_KIND_IMAGES.item].filter((src) => src !== undefined)
}

// Any index but the current one, when there is another.
const another = (current: number, count: number) => (count < 2 ? 0 : (current + 1 + Math.floor(Math.random() * (count - 1))) % count)

// An entry's picture in particles, a different one each time the tile is pointed at, with the latest
// character, a way to make another and to see them all; for someone with none yet, Start.
export function CharactersTile({ cards, entries, onCreate }: Props) {
  const latest = cards[0]
  const pictures = useMemo(() => picturesOf(entries), [entries])
  const [index, setIndex] = useState(0)
  const art = <ImageParticles src={pictures[index] ?? pictures[0]} className="absolute inset-0 size-full" />
  const onHot = (hot: boolean) => hot && setIndex((current) => another(current, pictures.length))

  if (!latest) {
    return (
      <BentoTile area="characters" wide onHot={onHot} art={art}>
        <HomeCardBody title="Create a character" line="Choose a species, class and background. It only takes a few minutes." actions={<Button onClick={onCreate}>Start</Button>} />
      </BentoTile>
    )
  }

  const { character, summary } = latest
  return (
    <BentoTile area="characters" wide onHot={onHot} art={art}>
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
