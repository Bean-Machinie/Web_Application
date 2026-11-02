import { forwardRef } from "react"
import { m } from "motion/react"
import type { Variants } from "motion/react"
import { AnimatedIcon } from "@/components/AnimatedIcon"
import type { IconHandle, IconProps } from "@/components/AnimatedIcon"

// Lucide's dice 6: on hover the die springs up a size and tips to one side. It settles back
// when the pointer leaves. The pips ride along without moving on their own.
const SPRING = { type: "spring", stiffness: 520, damping: 14, mass: 0.7 } as const

const tip: Variants = {
  normal: { scale: 1, rotate: 0, transition: SPRING },
  animate: { scale: 1.2, rotate: 14, transition: SPRING },
}

const PIPS = ["M8 8h.01", "M8 12h.01", "M8 16h.01", "M16 8h.01", "M16 12h.01", "M16 16h.01"]

const ORIGIN = { transformBox: "view-box", originX: "12px", originY: "12px" } as const

export const Dice6Icon = forwardRef<IconHandle, IconProps>((props, ref) => (
  <AnimatedIcon ref={ref} {...props}>
    <m.g variants={tip} style={ORIGIN}>
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      {PIPS.map((d) => (
        <path key={d} d={d} />
      ))}
    </m.g>
  </AnimatedIcon>
))
Dice6Icon.displayName = "Dice6Icon"
