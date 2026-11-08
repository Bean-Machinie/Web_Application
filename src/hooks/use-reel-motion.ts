import { useEffect, useRef } from "react"
import { animate, useAnimationFrame, useMotionValue } from "motion/react"
import type { MotionValue } from "motion/react"

// Cards per second; negative, so the cards rise away from the bottom left. Slow on its own, fast while
// the cards are pointed at.
const DRIFT = -0.2
const RUSH = -6
// A throw faster than this is held to it, so a wild flick does not blur the reel.
const MAX_THROW = 30

// Faster in than out, so it bursts off and glides to a stop.
const easeTo = (speed: MotionValue<number>, target: number) =>
  animate(speed, target, { duration: target === RUSH ? 0.6 : 1.4, ease: "easeOut" })

// The reel's position, in cards, running on forever. It drifts, speeds up into a fast loop while
// `rushing` and eases back down after. It can be grabbed and dragged; let go, it carries on at the speed
// it was thrown and eases back to its own pace. With reduced motion it only moves when dragged.
export function useReelMotion(rushing: boolean, reduced: boolean) {
  const offset = useMotionValue(0)
  const speed = useMotionValue(DRIFT)
  const held = useRef(false)
  const pace = rushing ? RUSH : DRIFT

  useAnimationFrame((_, delta) => {
    if (reduced || held.current) return
    // Capped, so coming back to a hidden tab does not jump the reel.
    offset.set(offset.get() + (speed.get() * Math.min(delta, 50)) / 1000)
  })

  useEffect(() => {
    const controls = easeTo(speed, pace)
    return () => controls.stop()
  }, [pace, speed])

  const grab = () => {
    held.current = true
    speed.stop()
  }

  const drag = (cards: number) => offset.set(offset.get() + cards)

  const release = () => {
    held.current = false
    if (reduced) return offset.set(Math.round(offset.get()))
    speed.set(Math.max(-MAX_THROW, Math.min(MAX_THROW, offset.getVelocity())))
    easeTo(speed, pace)
  }

  return { offset, grab, drag, release }
}
