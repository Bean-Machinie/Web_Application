import { forwardRef } from "react"
import { m } from "motion/react"
import type { Variants } from "motion/react"
import { AnimatedIcon } from "@/components/AnimatedIcon"
import type { IconHandle, IconProps } from "@/components/AnimatedIcon"

// Lucide's house: on hover the door lifts a little and settles back.
const SPRING = { type: "spring", stiffness: 420, damping: 16 } as const

const door: Variants = {
  normal: { y: 0, transition: SPRING },
  animate: { y: -1.5, transition: SPRING },
}

export const HouseIcon = forwardRef<IconHandle, IconProps>((props, ref) => (
  <AnimatedIcon ref={ref} {...props}>
    <m.path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" variants={door} />
    <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </AnimatedIcon>
))
HouseIcon.displayName = "HouseIcon"
