import { forwardRef } from "react"
import { m } from "motion/react"
import type { Variants } from "motion/react"
import { AnimatedIcon } from "@/components/AnimatedIcon"
import type { IconHandle, IconProps } from "@/components/AnimatedIcon"

// The large star of Lucide's sparkles, alone: it swells and turns a quarter.
const star: Variants = {
  normal: { scale: 1, rotate: 0 },
  animate: { scale: [1, 1.2, 1], rotate: [0, 45, 90], transition: { duration: 0.7, ease: "easeInOut" } },
}

export const SparkleIcon = forwardRef<IconHandle, IconProps>((props, ref) => (
  <AnimatedIcon ref={ref} {...props}>
    <m.path
      variants={star}
      style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}
      d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"
    />
  </AnimatedIcon>
))
SparkleIcon.displayName = "SparkleIcon"
