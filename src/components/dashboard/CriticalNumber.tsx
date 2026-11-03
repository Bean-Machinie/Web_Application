import { useCallback, useEffect, useRef, useState } from "react"
import { motion } from "motion/react"
import { TextShimmer } from "@/components/TextShimmer"
import { CRITICAL_COLOR } from "@/lib/dice-result"
import { createConfetti } from "@/lib/roll-confetti"
import { createEmbers } from "@/lib/roll-embers"
import { together } from "@/lib/roll-effect"
import { MomentCanvas } from "./MomentCanvas"
import { NUMBER_CLASS } from "./roll-number"
import type { Roll } from "@/lib/dice"

const fireworks = (rect: DOMRect) => together(createEmbers(rect), createConfetti(rect))

const GLOW = [`0 0 0px ${CRITICAL_COLOR}00`, `0 0 24px ${CRITICAL_COLOR}cc`, `0 0 10px ${CRITICAL_COLOR}66`]

// Twelve blurred rays of light behind the number that flare up, turn a little and die away.
function Rays() {
  return (
    <span aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 size-0">
      <motion.span
        className="absolute -top-52 -left-52 size-[26rem] rounded-full blur-[6px]"
        style={{
          backgroundImage: "repeating-conic-gradient(rgb(212 175 55 / 0.4) 0deg 7deg, transparent 7deg 30deg)",
          maskImage: "radial-gradient(closest-side, black 15%, transparent)",
        }}
        initial={{ opacity: 0, rotate: 0, scale: 0.7 }}
        animate={{ opacity: [0, 1, 0], rotate: 15, scale: 1.1 }}
        transition={{ duration: 1.2, times: [0, 0.25, 1], ease: "easeOut" }}
      />
    </span>
  )
}

// A thin ring from the middle of the number, out to about three times its size.
function Ring() {
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 100 100"
      className="pointer-events-none absolute inset-0 m-auto aspect-square h-full overflow-visible"
      initial={{ scale: 1, opacity: 1 }}
      animate={{ scale: 3, opacity: 0 }}
      transition={{ delay: 0.08, duration: 0.6, ease: "easeOut" }}
    >
      <circle cx="50" cy="50" r="49" fill="none" stroke={CRITICAL_COLOR} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </motion.svg>
  )
}

// The number slams down from 1.6 times its size, bounces and wobbles, with a ring, rays, embers and a confetti
// cannon on each side, and then the light sweeps over it.
export function CriticalNumber({ roll, reduced }: { roll: Roll; reduced: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [burst, setBurst] = useState(false)
  const done = useCallback(() => setBurst(false), [])

  useEffect(() => {
    if (reduced) return
    const timer = setTimeout(() => setBurst(true), 100)
    return () => clearTimeout(timer)
  }, [reduced])

  if (reduced) return <span className={NUMBER_CLASS} style={{ textShadow: GLOW[2] }}>{roll.total}</span>
  return (
    <span ref={ref} className={`relative inline-block ${NUMBER_CLASS}`}>
      <Rays />
      <Ring />
      <motion.span
        className="relative inline-block"
        initial={{ scale: 1.6 }}
        animate={{ scale: 1, y: [0, -16, 0, -6, 0], rotate: [-7, 5, -3, 1, 0], textShadow: GLOW }}
        transition={{
          scale: { type: "spring", stiffness: 420, damping: 10 },
          y: { delay: 0.12, duration: 0.8, ease: "easeOut" },
          rotate: { delay: 0.05, duration: 0.9, ease: "easeOut" },
          textShadow: { delay: 0.1, duration: 0.9, times: [0, 0.4, 1] },
        }}
      >
        {roll.total}
        <TextShimmer highlight="#f6e3a1" delay={0.5} duration={0.7} className="absolute inset-0 flex items-center justify-center">
          {String(roll.total).replace("-", "−")}
        </TextShimmer>
      </motion.span>
      {burst && <MomentCanvas target={ref} make={fireworks} onDone={done} />}
    </span>
  )
}
