import { useState } from "react"
import type { KeyboardEvent } from "react"
import { useElementSize } from "@/hooks/use-element-size"
import { PEEK_PX } from "@/lib/deck-pose"
import { HomeDeckCard } from "./HomeDeckCard"
import type { DeckCard } from "./HomeDeckCard"

// Room above the cards for the one that comes out of the deck, and at the right for its pull.
const TOP_PX = 24
const RIGHT_PX = 34
const CARD_PX = 240
const MIN_WIDTH_PX = 320

const wrap = (value: number, count: number) => ((value % count) + count) % count

// A deck of wide cards, the front one in full and the others behind it, each showing a little more of
// its right edge. Pointing at one behind brings it out toward you; pressing it, or the left and
// right keys, deals it to the front and the old front goes to the back.
export function HomeDeck({ cards }: { cards: DeckCard[] }) {
  const { ref, size } = useElementSize<HTMLElement>()
  const [front, setFront] = useState(0)
  const [hot, setHot] = useState<number | null>(null)
  const count = cards.length
  const width = Math.max(size.width - (count - 1) * PEEK_PX - RIGHT_PX, MIN_WIDTH_PX)

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "ArrowRight") setFront((current) => wrap(current + 1, count))
    else if (event.key === "ArrowLeft") setFront((current) => wrap(current - 1, count))
    else return
    event.preventDefault()
  }

  return (
    <section ref={ref} aria-label="Get going" onKeyDown={onKeyDown} style={{ height: TOP_PX + CARD_PX + 8 }} className="relative">
      {size.width > 0 &&
        cards.map((card, index) => (
          <HomeDeckCard
            key={card.key}
            card={card}
            width={width}
            rank={wrap(index - front, count)}
            hot={hot === index}
            shifted={hot !== null && hot !== front && index === front}
            onPick={() => {
              setFront(index)
              setHot(null)
            }}
            onHot={(on) => setHot((current) => (on ? index : current === index ? null : current))}
          />
        ))}
    </section>
  )
}
