import { motion } from "motion/react"
import type { Transition } from "motion/react"
import { useElementSize } from "@/hooks/use-element-size"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { DeckCard } from "./DeckCard"
import type { DeckCardData } from "./DeckCard"

const SPARK = "#f5b544"
// At rest: a tidy deck, the first card on top and the others peeking out behind it.
const DECK = [
  { x: 0, y: 0, rotate: -2 },
  { x: -5, y: 4, rotate: -9 },
  { x: 6, y: 5, rotate: 7 },
]
// Fanned: the first card in the middle, highest; the others to either side, leaning out. As fractions
// of the square, from its centre line and from its top.
const FAN = [
  { x: 0, y: 0.22, rotate: 0 },
  { x: -0.27, y: 0.31, rotate: -13 },
  { x: 0.27, y: 0.31, rotate: 13 },
]
const POP: Transition = { type: "spring", stiffness: 340, damping: 17, mass: 0.8 }
const TUCK: Transition = { type: "spring", stiffness: 420, damping: 32 }
const SPARKS = [
  { x: 0.2, y: 0.08, size: 10 },
  { x: 0.8, y: 0.06, size: 8 },
  { x: 0.92, y: 0.36, size: 6 },
  { x: 0.08, y: 0.4, size: 7 },
]

// The Compendium's cards in a tidy deck. Pointed at, they pop up one after another with a little bounce
// and fan out like a hand, a few sparks wink around them, and they bob gently while it stays hot; let
// go, they gather back into the deck.
export function CardDeck({ hot, cards }: { hot: boolean; cards: DeckCardData[] }) {
  const { ref, size } = useElementSize<HTMLDivElement>()
  const reduced = useReducedMotion()
  const fanned = hot || reduced
  const side = size.width
  const width = Math.min(112, Math.max(64, side * 0.27))
  const height = width * 1.36
  const centre = { x: side / 2 - width / 2, y: side * 0.36 - height / 2 }

  const pose = (index: number) => {
    const fan = FAN[index]
    const deck = DECK[index]
    return fanned
      ? { x: centre.x + fan.x * side, y: fan.y * side - height / 2, rotate: fan.rotate, scale: 1 }
      : { x: centre.x + deck.x, y: centre.y + deck.y, rotate: deck.rotate, scale: 0.9 }
  }
  const transition = (index: number): Transition => {
    if (reduced) return { duration: 0 }
    // The first card pops first, then the two either side of it; they gather in the other order.
    return hot ? { ...POP, delay: index * 0.07 } : { ...TUCK, delay: (FAN.length - 1 - index) * 0.05 }
  }

  return (
    <div ref={ref} className="absolute inset-0">
      {side > 0 &&
        cards.map((card, index) => (
          <motion.div
            key={card.key}
            className="absolute top-0 left-0"
            style={{ width, height, zIndex: cards.length - index }}
            initial={false}
            animate={pose(index)}
            transition={transition(index)}
          >
            <motion.div
              className="size-full"
              initial={false}
              animate={hot && !reduced ? { y: [0, -3, 0] } : { y: 0 }}
              transition={hot && !reduced ? { duration: 2.4 + index * 0.4, repeat: Infinity, ease: "easeInOut", delay: 0.6 } : { duration: 0.2 }}
            >
              <DeckCard card={card} />
            </motion.div>
          </motion.div>
        ))}
      {!reduced &&
        SPARKS.map((spark, index) => (
          <motion.svg
            key={index}
            aria-hidden
            viewBox="0 0 10 10"
            className="absolute"
            style={{ left: spark.x * side, top: spark.y * side, width: spark.size, height: spark.size, color: SPARK }}
            initial={false}
            animate={hot ? { scale: [0, 1.2, 0], rotate: [0, 90], opacity: [0, 1, 0] } : { scale: 0, opacity: 0 }}
            transition={hot ? { duration: 0.8, delay: 0.25 + index * 0.09, ease: "easeOut" } : { duration: 0 }}
          >
            <path d="M5 0 Q5.6 4.4 10 5 Q5.6 5.6 5 10 Q4.4 5.6 0 5 Q4.4 4.4 5 0Z" fill="currentColor" />
          </motion.svg>
        ))}
    </div>
  )
}
