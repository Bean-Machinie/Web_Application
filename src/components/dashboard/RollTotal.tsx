import { motion } from "motion/react"
import { SlidingNumber } from "@/components/SlidingNumber"
import { TextShimmer } from "@/components/TextShimmer"
import { cn } from "@/lib/utils"
import { CRITICAL_COLOR } from "@/lib/dice-result"
import type { Roll } from "@/lib/dice"
import type { Moment } from "@/lib/dice-result"

// What the side lines do: a critical widens and brightens them, a fumble draws them in and dims them.
const LINES = { normal: { width: 120, opacity: 0.5 }, critical: { width: 220, opacity: 1 }, fumble: { width: 60, opacity: 0.25 } }
const BLOOM = [`0 0 0px ${CRITICAL_COLOR}00`, `0 0 24px ${CRITICAL_COLOR}cc`, `0 0 10px ${CRITICAL_COLOR}66`]

// The number swells once and glows; on a fumble it drops, tilts and settles in one damped wobble.
const NUMBER = {
  critical: { animate: { scale: [1, 1.06, 1], textShadow: BLOOM }, transition: { delay: 0.25, duration: 0.8, times: [0, 0.4, 1], ease: "easeOut" as const } },
  fumble: { animate: { y: [0, 4, -1, 0], rotate: [0, -3, 1, 0] }, transition: { delay: 0.15, duration: 0.75, times: [0, 0.3, 0.65, 1], ease: "easeOut" as const } },
}

function Line({ side, moment, reduced }: { side: "left" | "right"; moment: Moment | null; reduced: boolean }) {
  return (
    <motion.span
      aria-hidden
      initial={moment && !reduced ? LINES.normal : false}
      animate={LINES[moment ?? "normal"]}
      transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
      className={cn("h-px from-transparent to-current", side === "left" ? "bg-gradient-to-r" : "bg-gradient-to-l")}
    />
  )
}

// The total with a line either side of it. A normal roll is left as it is; a critical or a fumble moves.
export function RollTotal({ roll, moment, reduced }: { roll: Roll; moment: Moment | null; reduced: boolean }) {
  const move = moment && !reduced ? NUMBER[moment] : undefined
  const still = moment === "critical" && reduced ? { textShadow: BLOOM[2] } : undefined
  return (
    <div className="flex items-center gap-5">
      <Line side="left" moment={moment} reduced={reduced} />
      <motion.p className="relative text-6xl leading-none font-semibold tabular-nums" style={still} animate={move?.animate} transition={move?.transition}>
        {reduced ? roll.total : <SlidingNumber value={roll.total} />}
        {moment === "critical" && !reduced && (
          <TextShimmer highlight="#f6e3a1" delay={0.25} duration={0.7} className="absolute inset-0 flex items-center justify-center">
            {String(roll.total).replace("-", "−")}
          </TextShimmer>
        )}
      </motion.p>
      <Line side="right" moment={moment} reduced={reduced} />
    </div>
  )
}
