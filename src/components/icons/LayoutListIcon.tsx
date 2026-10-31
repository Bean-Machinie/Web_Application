import { forwardRef } from "react"
import { m } from "motion/react"
import type { Variants } from "motion/react"
import { AnimatedIcon } from "@/components/AnimatedIcon"
import type { IconHandle, IconProps } from "@/components/AnimatedIcon"

// Lucide's layout-list: the four lines are written out again, one after the other, when played.
const line = (delay: number): Variants => ({
  normal: { pathLength: 1, opacity: 1 },
  animate: { pathLength: [0, 1], opacity: [0, 1], transition: { duration: 0.25, delay, ease: "easeOut" } },
})

export const LayoutListIcon = forwardRef<IconHandle, IconProps>((props, ref) => (
  <AnimatedIcon ref={ref} {...props}>
    <m.rect width="7" height="7" x="3" y="3" rx="1" />
    <m.rect width="7" height="7" x="3" y="14" rx="1" />
    <m.path d="M14 4h7" variants={line(0)} />
    <m.path d="M14 9h7" variants={line(0.1)} />
    <m.path d="M14 15h7" variants={line(0.2)} />
    <m.path d="M14 20h7" variants={line(0.3)} />
  </AnimatedIcon>
))
LayoutListIcon.displayName = "LayoutListIcon"
