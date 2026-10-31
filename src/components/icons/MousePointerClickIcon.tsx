import { forwardRef } from "react"
import { m } from "motion/react"
import type { Variants } from "motion/react"
import { AnimatedIcon } from "@/components/AnimatedIcon"
import type { IconHandle, IconProps } from "@/components/AnimatedIcon"

// Lucide's mouse-pointer-click: the pointer presses down and the four marks flash out.
const press: Variants = {
  normal: { scale: 1, x: 0, y: 0 },
  animate: { scale: [1, 0.88, 1], x: [0, 1, 0], y: [0, 1, 0], transition: { duration: 0.45, ease: "easeInOut" } },
}
const mark: Variants = {
  normal: { opacity: 1, pathLength: 1 },
  animate: { opacity: [0, 1], pathLength: [0, 1], transition: { duration: 0.3, delay: 0.2, ease: "easeOut" } },
}

export const MousePointerClickIcon = forwardRef<IconHandle, IconProps>((props, ref) => (
  <AnimatedIcon ref={ref} {...props}>
    <m.path d="M14 4.1 12 6" variants={mark} />
    <m.path d="m5.1 8-2.9-.8" variants={mark} />
    <m.path d="m6 12-1.9 2" variants={mark} />
    <m.path d="M7.2 2.2 8 5.1" variants={mark} />
    <m.path
      variants={press}
      style={{ transformBox: "view-box", originX: "9px", originY: "9px" }}
      d="M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z"
    />
  </AnimatedIcon>
))
MousePointerClickIcon.displayName = "MousePointerClickIcon"
