import { useMemo } from "react"
import { Link } from "react-router-dom"
import { BookOpen, PawPrint, Sparkles, Sword } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDeckDeal } from "@/hooks/use-deck-deal"
import { useShowcaseCreatures } from "@/hooks/use-showcase-creatures"
import type { ShowcaseCreature } from "@/lib/showcase-creatures"
import { BentoTile } from "./BentoTile"
import { CardDeck } from "./CardDeck"
import type { DeckCardData } from "./CardDeck"
import { HomeCardBody } from "./HomeCardBody"

// Cards for what the Compendium holds besides creatures, for a deck with fewer than four of them.
const STAND_INS: DeckCardData[] = [
  { key: "spells", name: "Spells", line: "SRD 5.2.1", image: null, icon: Sparkles },
  { key: "rules", name: "Rules", line: "SRD 5.2.1", image: null, icon: BookOpen },
  { key: "equipment", name: "Equipment", line: "SRD 5.2.1", image: null, icon: Sword },
]

// The person's newest creatures (or the Wolf) as cards, made up to four with spells, rules and equipment.
function deckOf(creatures: ShowcaseCreature[]): DeckCardData[] {
  const cards = creatures.slice(0, 4).map((creature) => ({
    key: creature.key,
    name: creature.name,
    line: creature.cr ? `CR ${creature.cr}` : "Creature",
    image: creature.image,
    icon: PawPrint,
  }))
  return [...cards, ...STAND_INS].slice(0, 4)
}

// The Compendium tile: a deck of its cards, dealt out across the tile when it is pointed at.
export function CompendiumTile() {
  const creatures = useShowcaseCreatures()
  const cards = useMemo(() => deckOf(creatures), [creatures])
  const { dealt, onHot } = useDeckDeal()

  return (
    <BentoTile area="compendium" onHot={onHot} raised={dealt} raisedFor={0.8} float={() => <CardDeck cards={cards} dealt={dealt} />}>
      <HomeCardBody title="Compendium" line="Creatures, spells and rules of the SRD." actions={
          <Button asChild>
            <Link to="/app/compendium">Browse creatures</Link>
          </Button>
        } />
    </BentoTile>
  )
}
