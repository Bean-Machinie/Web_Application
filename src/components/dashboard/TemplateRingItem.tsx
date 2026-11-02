import type { ReactNode } from "react"
import { motion, useTransform } from "motion/react"
import type { MotionValue } from "motion/react"
import { ringPose } from "@/lib/ring-layout"
import type { RingPose } from "@/lib/ring-layout"

type Props = {
  index: number
  count: number
  // Where the ring is turned to, in cards, and how wide it is.
  angle: MotionValue<number>
  radius: MotionValue<number>
  children: ReactNode
}

// Puts one card on the ring. Everything is read from the ring's moving position, so a turn
// moves the cards without React drawing again.
export function TemplateRingItem({ index, count, angle, radius, children }: Props) {
  const pick = (key: keyof RingPose) => ([turned, wide]: number[]) =>
    ringPose(index - turned, count, wide)[key]
  const inputs = [angle, radius]

  return (
    <motion.div
      style={{
        x: useTransform(inputs, pick("x")),
        y: useTransform(inputs, pick("y")),
        scale: useTransform(inputs, pick("scale")),
        opacity: useTransform(inputs, pick("opacity")),
        rotate: useTransform(inputs, pick("rotate")),
        zIndex: useTransform(inputs, pick("layer")),
      }}
      className="absolute inset-0 m-auto h-fit w-40"
    >
      {children}
    </motion.div>
  )
}
