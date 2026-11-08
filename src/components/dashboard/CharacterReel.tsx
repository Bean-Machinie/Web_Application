import { useState } from "react"
import type { PointerEvent } from "react"
import { useElementSize } from "@/hooks/use-element-size"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { useReelDrag } from "@/hooks/use-reel-drag"
import { useReelMotion } from "@/hooks/use-reel-motion"
import type { ReelCardData } from "@/lib/character-reel-cards"
import { REEL_SLANT, REEL_SPACING } from "@/lib/reel-pose"
import { ReelSlot } from "./ReelSlot"

// The middle card, as fractions of the tile: right of the text, so the reel rises from under the text at
// the bottom left, where the tile fades it out, to past the top right edge.
const MIDDLE = { x: 0.62, y: 0.52 }
const AXIS = { x: Math.cos((REEL_SLANT * Math.PI) / 180), y: Math.sin((REEL_SLANT * Math.PI) / 180) }

// Characters as cards on an endless reel that leans up from under the tile's text and drifts by.
// Touching the cards gives it a quick kick that glides back to the drift; it can be dragged and thrown.
export function CharacterReel({ cards }: { cards: ReelCardData[] }) {
  const reduced = useReducedMotion()
  const [onCards, setOnCards] = useState(false)
  const { ref, size } = useElementSize<HTMLDivElement>()
  const reel = useReelMotion(onCards, reduced)
  const height = Math.min(size.height * 0.62, size.width * 0.36 * 1.4)
  const width = height / 1.4
  const drag = useReelDrag(reel, AXIS, width * REEL_SPACING)

  // Only the cards take the pointer, so passing from one card to another is still on the cards.
  const onPointerOut = (event: PointerEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOnCards(false)
  }

  return (
    <div ref={ref} className="absolute inset-0" onPointerOver={() => setOnCards(true)} onPointerOut={onPointerOut} {...drag}>
      {width > 0 && (
        <div className="absolute" style={{ left: `${MIDDLE.x * 100}%`, top: `${MIDDLE.y * 100}%`, rotate: `${REEL_SLANT}deg` }}>
          {cards.map((card, index) => (
            <ReelSlot key={card.key} card={card} index={index} count={cards.length} offset={reel.offset} width={width} height={height} />
          ))}
        </div>
      )}
    </div>
  )
}
