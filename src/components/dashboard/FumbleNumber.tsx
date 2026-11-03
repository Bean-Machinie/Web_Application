import { useCallback, useEffect, useRef, useState } from "react"
import { motion } from "motion/react"
import { FUMBLE_COLOR } from "@/lib/dice-result"
import { createCrumble } from "@/lib/roll-crumble"
import { MomentCanvas } from "./MomentCanvas"
import { NUMBER_CLASS } from "./roll-number"
import type { Roll } from "@/lib/dice"

// The crack runs down the number in percents of its box; the two halves are the number clipped along it.
const CRACK = [[52, -6], [46, 18], [56, 34], [44, 52], [55, 70], [48, 86], [52, 106]]
const PATH = `M${CRACK.map((point) => point.join(" ")).join(" L")}`
const clip = (edge: number) => `polygon(${[[edge, -10], ...CRACK, [edge, 110]].map(([x, y]) => `${x}% ${y}%`).join(",")})`

// The crack opens about 4px and the halves tilt, with one damped wobble.
function Half({ side, total }: { side: -1 | 1; total: number }) {
  return (
    <motion.span
      aria-hidden
      className={side === -1 ? "relative inline-block" : "absolute inset-0"}
      style={{ clipPath: clip(side === -1 ? -40 : 140), transformOrigin: "50% 100%" }}
      animate={{ x: side * 2, rotate: side * 4 }}
      transition={{ type: "spring", stiffness: 600, damping: 15, delay: 0.35 }}
    >
      {total}
    </motion.span>
  )
}

const stroke = { initial: { pathLength: 0 }, animate: { pathLength: 1 }, transition: { delay: 0.2, duration: 0.15, ease: "linear" as const } }

function Crack() {
  return (
    <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
      <motion.path d={PATH} fill="none" stroke="rgb(255 205 195 / 0.28)" strokeWidth="3.5" vectorEffect="non-scaling-stroke" {...stroke} />
      <motion.path d={PATH} fill="none" stroke="#2a1214" strokeWidth="2" vectorEffect="non-scaling-stroke" {...stroke} />
    </svg>
  )
}

const crumble = (rect: DOMRect, el: HTMLElement) => createCrumble(rect, el, FUMBLE_COLOR)

// The number cracks, splits and crumbles away, leaving only the word under it. With less motion it just stays, in red.
export function FumbleNumber({ roll, reduced }: { roll: Roll; reduced: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [gone, setGone] = useState(false)
  const [falling, setFalling] = useState(true)
  const done = useCallback(() => setFalling(false), [])

  useEffect(() => {
    if (reduced) return
    const timer = setTimeout(() => setGone(true), 500)
    return () => clearTimeout(timer)
  }, [reduced])

  if (reduced) return <span className={NUMBER_CLASS}>{roll.total}</span>
  return (
    <span ref={ref} data-text={roll.total} className={`relative inline-block ${NUMBER_CLASS}`}>
      <span className="sr-only">{roll.total}</span>
      <span aria-hidden className="relative inline-block" style={{ opacity: gone ? 0 : 1 }}>
        <Half side={-1} total={roll.total} />
        <Half side={1} total={roll.total} />
        <Crack />
      </span>
      {gone && falling && <MomentCanvas target={ref} make={crumble} onDone={done} />}
    </span>
  )
}
