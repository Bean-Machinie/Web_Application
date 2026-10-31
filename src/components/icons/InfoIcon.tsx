import { forwardRef } from "react"
import { m } from "motion/react"
import type { Variants } from "motion/react"
import { AnimatedIcon } from "@/components/AnimatedIcon"
import type { IconHandle, IconProps } from "@/components/AnimatedIcon"

// Lucide's info: the dot and the stem hop in turn.
const hop = (delay: number): Variants => ({
  normal: { y: 0 },
  animate: { y: [0, -2, 0], transition: { duration: 0.4, delay, ease: "easeInOut" } },
})

export const InfoIcon = forwardRef<IconHandle, IconProps>((props, ref) => (
  <AnimatedIcon ref={ref} {...props}>
    <circle cx="12" cy="12" r="10" />
    <m.path variants={hop(0.08)} d="M12 16v-4" />
    <m.path variants={hop(0)} d="M12 8h.01" />
  </AnimatedIcon>
))
InfoIcon.displayName = "InfoIcon"
