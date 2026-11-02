import { forwardRef } from "react"
import { m } from "motion/react"
import type { Variants } from "motion/react"
import { AnimatedIcon } from "@/components/AnimatedIcon"
import type { IconHandle, IconProps } from "@/components/AnimatedIcon"

// The one plus of the app: it springs up a size when played. Reduced motion is handled by
// AnimatedIcon, which does not play it.
const SPRING = { type: "spring", stiffness: 520, damping: 14, mass: 0.7 } as const
const grow: Variants = {
  normal: { scale: 1, transition: SPRING },
  animate: { scale: 1.2, transition: SPRING },
}

export const PlusIcon = forwardRef<IconHandle, IconProps>((props, ref) => (
  <AnimatedIcon ref={ref} {...props}>
    <m.path
      d="M5 12h14M12 5v14"
      variants={grow}
      style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}
    />
  </AnimatedIcon>
))
PlusIcon.displayName = "PlusIcon"
