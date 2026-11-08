import { useEffect } from "react"
import { animate, motion, useMotionValue } from "motion/react"
import { gatherPose, throwPose } from "@/lib/card-throw"
import type { CardPlace } from "@/lib/card-throw"
import type { DeckCardData } from "./CardDeck"
import { CharacterReelCard } from "./CharacterReelCard"

type Props = {
  card: DeckCardData
  width: number
  height: number
  // Its place in the deck and where it lands, its top left corner in pixels.
  deck: CardPlace
  landing: CardPlace
  thrown: boolean
  // When it is dealt after the deal starts, and when it gathers after the gathering starts, in seconds.
  delay: number
  gatherDelay: number
  zIndex: number
  reduced: boolean
}

// Quick off the deck and a long, even glide into place, with no bounce or overshoot.
const DEAL_EASE = [0.22, 1, 0.36, 1] as const
const DEAL_S = 0.8
const GATHER_EASE = [0.4, 0, 0.2, 1] as const
const GATHER_S = 0.45

// A card of the Compendium deck. Dealt, it glides off the deck along a gentle arc, turning evenly to its
// angle, its shadow spreading as it rises and closing in as it settles. Gathered, it slides straight
// back to the deck.
export function ThrownCard({ card, width, height, deck, landing, thrown, delay, gatherDelay, zIndex, reduced }: Props) {
  const progress = useMotionValue(0)
  const gather = useMotionValue(0)
  const x = useMotionValue(deck.x)
  const y = useMotionValue(deck.y)
  const rotate = useMotionValue(deck.rotate)
  const boxShadow = useMotionValue("none")

  useEffect(() => {
    const place = () => {
      const flying = throwPose(deck, landing, progress.get())
      const at = gather.get() > 0 ? gatherPose(flying, deck, gather.get()) : flying
      const lift = gather.get() > 0 ? 0 : flying.lift
      x.set(at.x)
      y.set(at.y)
      rotate.set(at.rotate)
      boxShadow.set(`0 ${6 + lift * 14}px ${16 + lift * 20}px -10px rgb(0 0 0 / ${0.45 + lift * 0.15})`)
    }
    place()
    const stops = [progress, gather].map((value) => value.on("change", place))
    return () => stops.forEach((stop) => stop())
  }, [deck, landing, progress, gather, x, y, rotate, boxShadow])

  useEffect(() => {
    if (reduced) {
      gather.set(0)
      progress.set(thrown ? 1 : 0)
      return
    }
    if (thrown) {
      gather.set(0)
      progress.set(0)
      const controls = animate(progress, 1, { duration: DEAL_S, ease: DEAL_EASE, delay })
      return () => controls.stop()
    }
    if (progress.get() === 0) return
    const controls = animate(gather, 1, { duration: GATHER_S, ease: GATHER_EASE, delay: gatherDelay })
    // Back in the deck, it is ready to be dealt again.
    controls.then(() => {
      progress.set(0)
      gather.set(0)
    })
    return () => controls.stop()
  }, [thrown, reduced, delay, gatherDelay, progress, gather])

  return (
    <motion.div className="absolute top-0 left-0 rounded-xl" style={{ width, height, x, y, rotate, boxShadow, zIndex }}>
      <CharacterReelCard card={card} icon={card.icon} />
    </motion.div>
  )
}
