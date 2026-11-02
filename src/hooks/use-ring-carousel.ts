import { useCallback, useEffect, useRef, useState } from "react"
import type { KeyboardEvent, RefObject } from "react"
import { useReducedMotion, useSpring } from "motion/react"
import { shortestStep } from "@/lib/ring-layout"

// A turn of the ring is quick and overshoots a touch.
const TURN = { stiffness: 220, damping: 20, mass: 0.7 }
// How far the wheel has to move for one step, and the pause after it, so that the long tail of
// a trackpad flick does not spin the ring round and round.
const WHEEL_STEP = 40
const WHEEL_PAUSE_MS = 160
// The ring starts this many cards round and swings into place.
const INTRO_STEPS = -3

const wrap = (value: number, count: number) => ((value % count) + count) % count

type Options = {
  count: number
  // Where the wheel turns it: scrolling over this element does not scroll the page.
  stage: RefObject<HTMLElement | null>
  // Called when it starts to turn.
  onTurn?: () => void
}

// The turning of a ring of `count` cards. `angle` is the ring's position in cards, kept
// moving by a spring and never wrapped, so a card goes round the back rather than across the
// front; `active` is the card in front.
export function useRingCarousel({ count, stage, onTurn }: Options) {
  const reduced = useReducedMotion()
  const angle = useSpring(reduced ? 0 : INTRO_STEPS, TURN)
  const target = useRef(0)
  const [active, setActive] = useState(0)

  useEffect(() => {
    angle.set(0)
  }, [angle])

  const go = useCallback(
    (steps: number) => {
      target.current += steps
      if (reduced) angle.jump(target.current)
      else angle.set(target.current)
      setActive(wrap(target.current, count))
      onTurn?.()
    },
    [angle, count, reduced, onTurn]
  )

  const goTo = useCallback(
    (index: number) => go(shortestStep(index, wrap(target.current, count), count)),
    [go, count]
  )

  // Not a React handler: those are passive, and could not keep the page from scrolling.
  useEffect(() => {
    const element = stage.current
    if (!element) return
    let carried = 0
    let last = 0
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      const now = performance.now()
      if (now - last < WHEEL_PAUSE_MS) return
      carried += Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
      if (Math.abs(carried) < WHEEL_STEP) return
      go(Math.sign(carried))
      carried = 0
      last = now
    }
    element.addEventListener("wheel", onWheel, { passive: false })
    return () => element.removeEventListener("wheel", onWheel)
  }, [stage, go])

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") go(-1)
    else if (event.key === "ArrowRight") go(1)
    else return
    event.preventDefault()
  }

  return { angle, active, go, goTo, onKeyDown }
}
