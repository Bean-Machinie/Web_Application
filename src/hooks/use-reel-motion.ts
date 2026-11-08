import { useEffect, useRef } from "react"
import { animate, useAnimationFrame, useMotionValue } from "motion/react"
import type { AnimationPlaybackControls } from "motion/react"

// Cards per second; negative, so the cards rise away from the bottom left. A slow drift on its own,
// and this fast for a moment when the cards are touched.
const DRIFT = -0.2
const KICK = -6
// How long a kick lasts, and the share of it spent getting up to speed before easing back to the drift.
const KICK_S = 1.6
const KICK_PEAK = 0.15
// A throw faster than this is held to it, so a wild flick does not blur the reel.
const MAX_THROW = 30

// The reel's position, in cards, running on forever. It drifts; each time the pointer comes onto its
// cards it gets a quick kick and glides back down to the drift, whether the pointer stays or not. It can
// be grabbed and dragged; let go, it carries on at the speed it was thrown and eases back to the drift.
// With reduced motion it only moves when dragged.
export function useReelMotion(touched: boolean, reduced: boolean) {
  const offset = useMotionValue(0)
  const speed = useMotionValue(DRIFT)
  const held = useRef(false)
  const easing = useRef<AnimationPlaybackControls | null>(null)

  useAnimationFrame((_, delta) => {
    if (reduced || held.current) return
    // Capped, so coming back to a hidden tab does not jump the reel.
    offset.set(offset.get() + (speed.get() * Math.min(delta, 50)) / 1000)
  })

  // Only the moment the cards are touched starts a kick; leaving them does not cut it short.
  useEffect(() => {
    if (!touched || reduced || held.current) return
    easing.current?.stop()
    easing.current = animate(speed, [speed.get(), KICK, DRIFT], { duration: KICK_S, times: [0, KICK_PEAK, 1], ease: ["easeOut", "easeInOut"] })
  }, [touched, reduced, speed])

  useEffect(() => () => easing.current?.stop(), [])

  const grab = () => {
    held.current = true
    easing.current?.stop()
  }

  const drag = (cards: number) => offset.set(offset.get() + cards)

  const release = () => {
    held.current = false
    if (reduced) return offset.set(Math.round(offset.get()))
    speed.set(Math.max(-MAX_THROW, Math.min(MAX_THROW, offset.getVelocity())))
    easing.current = animate(speed, DRIFT, { duration: 1.4, ease: "easeOut" })
  }

  return { offset, grab, drag, release }
}
