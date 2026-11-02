import type { ReactNode } from "react"
import { motion, useTransform } from "motion/react"
import type { MotionValue } from "motion/react"
import { ringPose } from "@/lib/ring-layout"
import type { RingPose } from "@/lib/ring-layout"

type Props = {
  index: number
  count: number
  // Where the ring is turned to, in cards.
  angle: MotionValue<number>
  // How wide the ring is, and how far its back cards rise, in pixels.
  radius: MotionValue<number>
  rise: MotionValue<number>
  // The card's width in pixels.
  width: number
  children: ReactNode
}

// Puts one card on the ring. Everything is read from the ring's moving position, so a turn
// moves the cards without React drawing again.
export function TemplateRingItem({ index, count, angle, radius, rise, width, children }: Props) {
  const inputs = [angle, radius, rise]
  const pick = (key: keyof RingPose) => ([turned, wide, high]: number[]) =>
    ringPose(index - turned, count, wide, high)[key]

  return (
    <motion.div
      style={{
        width,
        x: useTransform(inputs, pick("x")),
        y: useTransform(inputs, pick("y")),
        scale: useTransform(inputs, pick("scale")),
        opacity: useTransform(inputs, pick("opacity")),
        rotate: useTransform(inputs, pick("rotate")),
        zIndex: useTransform(inputs, pick("layer")),
      }}
      className="absolute inset-0 m-auto h-fit"
    >
      {children}
    </motion.div>
  )
}
