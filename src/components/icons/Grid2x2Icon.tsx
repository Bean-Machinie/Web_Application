import { forwardRef } from "react"
import { m } from "motion/react"
import type { Variants } from "motion/react"
import { AnimatedIcon } from "@/components/AnimatedIcon"
import type { IconHandle, IconProps } from "@/components/AnimatedIcon"

// Lucide's grid-2x2: the two lines are drawn again, one after the other, when played.
const line = (delay: number): Variants => ({
  normal: { pathLength: 1, opacity: 1 },
  animate: { pathLength: [0, 1], opacity: [0, 1], transition: { duration: 0.35, delay, ease: "easeOut" } },
})

export const Grid2x2Icon = forwardRef<IconHandle, IconProps>((props, ref) => (
  <AnimatedIcon ref={ref} {...props}>
    <m.rect x="3" y="3" width="18" height="18" rx="2" />
    <m.path d="M12 3v18" variants={line(0)} />
    <m.path d="M3 12h18" variants={line(0.15)} />
  </AnimatedIcon>
))
Grid2x2Icon.displayName = "Grid2x2Icon"
