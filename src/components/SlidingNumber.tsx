import { useEffect } from "react"
import { motion, useSpring, useTransform } from "motion/react"
import type { MotionValue } from "motion/react"

const DIGITS = Array.from({ length: 10 }, (_, digit) => digit)

// Every digit of the wheel sits at its distance from the shown one, wrapped so that 9 rolls on to 0.
function Slot({ digit, position }: { digit: number; position: MotionValue<number> }) {
  const y = useTransform(position, (latest) => {
    const offset = (10 + digit - (latest % 10)) % 10
    return `${(offset > 5 ? offset - 10 : offset) * 100}%`
  })
  return (
    <motion.span style={{ y }} className="absolute inset-0 flex items-center justify-center">
      {digit}
    </motion.span>
  )
}

// A wheel that starts at 0 and turns to its digit when it appears.
function Wheel({ digit }: { digit: number }) {
  const position = useSpring(0, { stiffness: 90, damping: 18 })
  useEffect(() => position.set(digit), [position, digit])
  return (
    <span className="relative inline-block w-[1ch] overflow-hidden">
      <span className="invisible">0</span>
      {DIGITS.map((slot) => (
        <Slot key={slot} digit={slot} position={position} />
      ))}
    </span>
  )
}

export function SlidingNumber({ value }: { value: number }) {
  const digits = String(Math.abs(Math.trunc(value))).split("").map(Number)
  return (
    <span className="inline-flex tabular-nums">
      {value < 0 && "−"}
      {digits.map((digit, index) => (
        // Keyed from the right, so the units wheel stays the units wheel.
        <Wheel key={digits.length - index} digit={digit} />
      ))}
    </span>
  )
}
