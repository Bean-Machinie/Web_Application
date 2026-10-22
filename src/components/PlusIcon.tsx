import { m } from "motion/react"
import type { Variants } from "motion/react"
import { forwardRef } from "react"
import { AnimatedIcon } from "./AnimatedIcon"
import type { IconHandle, IconProps } from "./AnimatedIcon"

// A quarter turn with a swell; a plus looks the same every 90 degrees, so it lands as itself.
const turn: Variants = {
  normal: { rotate: 0, scale: 1, transition: { duration: 0 } },
  animate: { rotate: [0, 90], scale: [1, 1.2, 1], transition: { duration: 0.5, ease: "easeInOut" } },
}

// Spans 3 to 21, the live area of every icon.
export const PlusIcon = forwardRef<IconHandle, IconProps>((props, ref) => (
  <AnimatedIcon ref={ref} {...props}>
    <m.g variants={turn} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}>
      <path d="M12 3V21" />
      <path d="M3 12H21" />
    </m.g>
  </AnimatedIcon>
))

PlusIcon.displayName = "PlusIcon"
