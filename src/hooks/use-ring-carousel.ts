import { useCallback, useEffect, useRef, useState } from "react"
import type { KeyboardEvent } from "react"
import { useReducedMotion, useSpring } from "motion/react"
import { shortestStep } from "@/lib/ring-layout"

// A turn of the ring is quick and overshoots a touch.
const TURN = { stiffness: 220, damping: 20, mass: 0.7 }
// The ring starts this many cards round and swings into place.
const INTRO_STEPS = -3

const wrap = (value: number, count: number) => ((value % count) + count) % count

type Options = {
  count: number
  // Called when it starts to turn.
  onTurn?: () => void
}

// The turning of a ring of `count` cards. `angle` is the ring's position in cards, kept
// moving by a spring and never wrapped, so a card goes round the back rather than across the
// front; `active` is the card in front. The wheel and dragging are in their own hooks, which
// turn it with `go` and `moveTo`.
export function useRingCarousel({ count, onTurn }: Options) {
  const reduced = useReducedMotion()
  const angle = useSpring(reduced ? 0 : INTRO_STEPS, TURN)
  const target = useRef(0)
  const [active, setActive] = useState(0)

  useEffect(() => {
    angle.set(0)
  }, [angle])

  // Turns to this position, a whole number of cards from the start.
  const moveTo = useCallback(
    (position: number) => {
      target.current = position
      if (reduced) angle.jump(position)
      else angle.set(position)
      setActive(wrap(position, count))
      onTurn?.()
    },
    [angle, count, reduced, onTurn]
  )

  const go = useCallback((steps: number) => moveTo(target.current + steps), [moveTo])

  const goTo = useCallback(
    (index: number) => go(shortestStep(index, wrap(target.current, count), count)),
    [go, count]
  )

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") go(-1)
    else if (event.key === "ArrowRight") go(1)
    else return
    event.preventDefault()
  }

  return { angle, active, go, goTo, moveTo, onKeyDown }
}
