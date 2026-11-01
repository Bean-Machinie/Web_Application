import { forwardRef } from "react"
import { m } from "motion/react"
import type { Variants } from "motion/react"
import { AnimatedIcon } from "@/components/AnimatedIcon"
import type { IconHandle, IconProps } from "@/components/AnimatedIcon"

// Lucide's swords: the blades cross a little further when played.
const clash: Variants = {
  normal: { rotate: 0 },
  animate: { rotate: [0, -6, 6, 0], transition: { duration: 0.4, ease: "easeInOut" } },
}

export const SwordsIcon = forwardRef<IconHandle, IconProps>((props, ref) => (
  <AnimatedIcon ref={ref} {...props}>
    <m.g variants={clash} style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}>
      <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
      <line x1="13" x2="19" y1="19" y2="13" />
      <line x1="16" x2="20" y1="16" y2="20" />
      <line x1="19" x2="21" y1="21" y2="19" />
      <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" />
      <line x1="5" x2="9" y1="14" y2="18" />
      <line x1="7" x2="4" y1="17" y2="20" />
      <line x1="3" x2="5" y1="19" y2="21" />
    </m.g>
  </AnimatedIcon>
))
SwordsIcon.displayName = "SwordsIcon"
