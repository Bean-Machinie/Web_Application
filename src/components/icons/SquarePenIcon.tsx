import { forwardRef } from "react"
import { m } from "motion/react"
import type { Variants } from "motion/react"
import { AnimatedIcon } from "@/components/AnimatedIcon"
import type { IconHandle, IconProps } from "@/components/AnimatedIcon"

// Lucide's square-pen: the pen writes a little when played.
const pen: Variants = {
  normal: { rotate: 0, x: 0, y: 0 },
  animate: { rotate: [0, -12, 6, -3, 0], x: [0, -1, 0.5, 0], y: [0, 1, -0.5, 0], transition: { duration: 0.7, ease: "easeInOut" } },
}

export const SquarePenIcon = forwardRef<IconHandle, IconProps>((props, ref) => (
  <AnimatedIcon ref={ref} {...props}>
    <m.path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <m.path
      variants={pen}
      style={{ transformBox: "view-box", originX: "9px", originY: "15px" }}
      d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"
    />
  </AnimatedIcon>
))
SquarePenIcon.displayName = "SquarePenIcon"
