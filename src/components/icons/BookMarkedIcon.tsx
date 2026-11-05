import { forwardRef } from "react"
import { m } from "motion/react"
import type { Variants } from "motion/react"
import { AnimatedIcon } from "@/components/AnimatedIcon"
import type { IconHandle, IconProps } from "@/components/AnimatedIcon"

// Lucide's book-marked: on hover the bookmark drops a little and settles back.
const SPRING = { type: "spring", stiffness: 420, damping: 16 } as const

const ribbon: Variants = {
  normal: { y: 0, transition: SPRING },
  animate: { y: 1.5, transition: SPRING },
}

export const BookMarkedIcon = forwardRef<IconHandle, IconProps>((props, ref) => (
  <AnimatedIcon ref={ref} {...props}>
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
    <m.path d="M10 2v8l3-3 3 3V2" variants={ribbon} />
  </AnimatedIcon>
))
BookMarkedIcon.displayName = "BookMarkedIcon"
