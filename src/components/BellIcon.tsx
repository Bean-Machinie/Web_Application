import { m } from "motion/react"
import type { Variants } from "motion/react"
import { forwardRef } from "react"
import { AnimatedIcon } from "./AnimatedIcon"
import type { IconHandle, IconProps } from "./AnimatedIcon"

// Swings from the top and settles.
const swing: Variants = {
  normal: { rotate: 0 },
  animate: { rotate: [0, -12, 10.2, -6, 3, 0], transition: { duration: 1.1, ease: "easeInOut" } },
}

// Spans 3 to 21 across, the live area of every icon.
export const BellIcon = forwardRef<IconHandle, IconProps>((props, ref) => (
  <AnimatedIcon ref={ref} {...props}>
    <m.g variants={swing} style={{ transformBox: "view-box", originX: "12px", originY: "3px" }}>
      <path d="M19 11V12.7558C19 13.5514 19.3161 14.3145 19.8787 14.8771L20.4819 15.4803C20.8136 15.8121 21 16.262 21 16.7311C21 17.708 20.208 18.5 19.2311 18.5H4.76887C3.79195 18.5 3 17.708 3 16.7311C3 16.262 3.18636 15.8121 3.51809 15.4803L4.12132 14.8771C4.68393 14.3145 5 13.5514 5 12.7558V10C5 6.13401 8.13401 3 12 3C15.866 3 19 6.13401 19 10V11Z" />
      <path d="M15.5 18.5C15.5 20.433 13.933 22 12 22C10.067 22 8.5 20.433 8.5 18.5" />
    </m.g>
  </AnimatedIcon>
))

BellIcon.displayName = "BellIcon"
