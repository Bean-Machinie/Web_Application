import { useMemo } from "react"
import { BookOpen, PawPrint, Sparkles } from "lucide-react"
import { useShowcaseCreatures } from "@/hooks/use-showcase-creatures"
import type { ShowcaseCreature } from "@/lib/showcase-creatures"
import { BentoTile } from "./BentoTile"
import { CardDeck } from "./CardDeck"
import type { DeckCardData } from "./DeckCard"
import { HomeCardBody } from "./HomeCardBody"
import { TileLink } from "./TileLink"

// Cards for what the Compendium holds besides creatures, for a deck with fewer than three of them.
const STAND_INS: DeckCardData[] = [
  { key: "spells", name: "Spells", meta: "SRD 5.2.1", image: null, icon: Sparkles },
  { key: "rules", name: "Rules", meta: "SRD 5.2.1", image: null, icon: BookOpen },
]

// The person's newest creatures (or the Wolf) as cards, made up to three with spells and rules.
function deckOf(creatures: ShowcaseCreature[]): DeckCardData[] {
  const cards = creatures.slice(0, 3).map((creature) => ({
    key: creature.key,
    name: creature.name,
    meta: creature.cr ? `CR ${creature.cr}` : "Creature",
    image: creature.image,
    icon: PawPrint,
  }))
  return [...cards, ...STAND_INS].slice(0, 3)
}

// The Compendium tile: a deck of its cards that pops out into a fan when the tile is pointed at.
export function CompendiumTile() {
  const creatures = useShowcaseCreatures()
  const cards = useMemo(() => deckOf(creatures), [creatures])

  return (
    <BentoTile area="compendium" float={(hot) => <CardDeck hot={hot} cards={cards} />}>
      <HomeCardBody title="Compendium" line="Creatures, spells and rules of the SRD." actions={<TileLink to="/app/compendium">Browse creatures</TileLink>} />
    </BentoTile>
  )
}
