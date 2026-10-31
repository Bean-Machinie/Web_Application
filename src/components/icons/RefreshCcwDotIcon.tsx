import { forwardRef } from "react"
import { m } from "motion/react"
import type { Variants } from "motion/react"
import { AnimatedIcon } from "@/components/AnimatedIcon"
import type { IconHandle, IconProps } from "@/components/AnimatedIcon"

// Lucide's refresh-ccw-dot: the arrows turn back once round the dot, which stays.
const arrows: Variants = {
  normal: { rotate: 0 },
  animate: { rotate: -360, transition: { duration: 0.8, ease: "easeInOut" } },
}

export const RefreshCcwDotIcon = forwardRef<IconHandle, IconProps>((props, ref) => (
  <AnimatedIcon ref={ref} {...props}>
    <m.g variants={arrows} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}>
      <path d="M3 2v6h6" />
      <path d="M21 12A9 9 0 0 0 6 5.3L3 8" />
      <path d="M21 22v-6h-6" />
      <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7" />
    </m.g>
    <circle cx="12" cy="12" r="1" />
  </AnimatedIcon>
))
RefreshCcwDotIcon.displayName = "RefreshCcwDotIcon"
