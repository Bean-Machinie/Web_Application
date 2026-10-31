import { forwardRef } from "react"
import { m } from "motion/react"
import type { Variants } from "motion/react"
import { AnimatedIcon } from "@/components/AnimatedIcon"
import type { IconHandle, IconProps } from "@/components/AnimatedIcon"

// Lucide's user-pen: the pen writes a little when played.
const pen: Variants = {
  normal: { rotate: 0 },
  animate: { rotate: [0, -14, 8, -4, 0], transition: { duration: 0.7, ease: "easeInOut", times: [0, 0.35, 0.65, 0.85, 1] } },
}

export const UserPenIcon = forwardRef<IconHandle, IconProps>((props, ref) => (
  <AnimatedIcon ref={ref} {...props}>
    <m.path d="M11.5 15H7a4 4 0 0 0-4 4v2" />
    <m.circle cx="10" cy="7" r="4" />
    <m.path
      variants={pen}
      style={{ transformBox: "view-box", originX: "15px", originY: "20px" }}
      d="M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"
    />
  </AnimatedIcon>
))
UserPenIcon.displayName = "UserPenIcon"
