import { useMemo } from "react"
import { useElementSize } from "@/hooks/use-element-size"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import type { LucideIcon } from "lucide-react"
import type { ReelCardData } from "@/lib/character-reel-cards"
import { ThrownCard } from "./ThrownCard"

// A card of the deck: as the Characters reel's cards, with an icon for one without a picture.
export type DeckCardData = ReelCardData & { icon: LucideIcon }

// At rest: a squared deck at the left of the tile, leaning a little, the first card on top. Across and
// down, the cards' middle as fractions of the tile, above the text.
const DECK = { x: 0.25, y: 0.32 }
const SQUARED = [
  { x: 0, y: 0, rotate: -8 },
  { x: 2, y: 2, rotate: -10 },
  { x: 4, y: 4, rotate: -6 },
]
// Dealt: spread down to the right in even steps, the top card farthest, so each lies over the one left
// of it, each turned the same few degrees more than the last, as a dealer spreads a hand.
const LANDING = [
  { x: 0.73, y: 0.4, rotate: 12 },
  { x: 0.5, y: 0.37, rotate: 5 },
  { x: 0.27, y: 0.34, rotate: -2 },
]
const DEAL_GAP_S = 0.13

type Props = { cards: DeckCardData[]; dealt: boolean }

// The Compendium's cards as a squared deck at the left. Pointed at, they are dealt one after another and
// glide into an even spread to the right, the same every time; they lie there for a while after, then
// gather back.
export function CardDeck({ cards, dealt }: Props) {
  const { ref, size } = useElementSize<HTMLDivElement>()
  const reduced = useReducedMotion()
  const side = size.width
  const width = Math.min(168, Math.max(100, side * 0.36))
  const height = width * 1.4

  // Kept the same between renders, so the cards are not placed again for nothing.
  const places = useMemo(
    () =>
      cards.map((_, index) => {
        const squared = SQUARED[index]
        const landing = LANDING[index]
        return {
          deck: { x: DECK.x * side - width / 2 + squared.x, y: DECK.y * side - height / 2 + squared.y, rotate: squared.rotate },
          landing: { x: landing.x * side - width / 2, y: landing.y * side - height / 2, rotate: landing.rotate },
        }
      }),
    [cards, side, width, height]
  )

  return (
    <div ref={ref} className="absolute inset-0">
      {side > 0 &&
        cards.map((card, index) => (
          <ThrownCard
            key={card.key}
            card={card}
            width={width}
            height={height}
            deck={places[index].deck}
            landing={places[index].landing}
            thrown={dealt}
            delay={index * DEAL_GAP_S}
            gatherDelay={(cards.length - 1 - index) * 0.06}
            zIndex={cards.length - index}
            reduced={reduced}
          />
        ))}
    </div>
  )
}
