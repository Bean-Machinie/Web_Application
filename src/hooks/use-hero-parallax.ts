import type { PointerEvent } from "react"
import { useMotionValue, useSpring, useTransform } from "motion/react"

const MAX_PX = 6

// How far to shift a picture, at most 6px, as the pointer moves over its card: the way the
// picture goes is against the pointer. Spread `handlers` on the card.
export function useHeroParallax() {
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const x = useSpring(useTransform(px, [-0.5, 0.5], [MAX_PX, -MAX_PX]), { stiffness: 120, damping: 20 })
  const y = useSpring(useTransform(py, [-0.5, 0.5], [MAX_PX, -MAX_PX]), { stiffness: 120, damping: 20 })

  const handlers = {
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      const box = event.currentTarget.getBoundingClientRect()
      px.set((event.clientX - box.left) / box.width - 0.5)
      py.set((event.clientY - box.top) / box.height - 0.5)
    },
    onPointerLeave: () => {
      px.set(0)
      py.set(0)
    },
  }
  return { x, y, handlers }
}
