import { motion } from "motion/react"
import { SlidingNumber } from "@/components/SlidingNumber"
import { cn } from "@/lib/utils"
import { CriticalNumber } from "./CriticalNumber"
import { FumbleNumber } from "./FumbleNumber"
import { NUMBER_CLASS } from "./roll-number"
import type { Roll } from "@/lib/dice"
import type { Moment } from "@/lib/dice-result"

// What the side lines do: a critical widens and brightens them; on a fumble they snap in and dim as the number crumbles.
const LINES = { normal: { width: 120, opacity: 0.5 }, critical: { width: 220, opacity: 1 }, fumble: { width: 40, opacity: 0.2 } }
const LINE_TIMING = {
  normal: { delay: 0.15, duration: 0.5 },
  critical: { delay: 0.35, duration: 0.5 },
  fumble: { delay: 0.5, duration: 0.12 },
}

function Line({ side, moment, reduced }: { side: "left" | "right"; moment: Moment | null; reduced: boolean }) {
  const key = moment ?? "normal"
  return (
    <motion.span
      aria-hidden
      initial={moment && !reduced ? LINES.normal : false}
      animate={LINES[key]}
      transition={{ ...LINE_TIMING[key], ease: "easeOut" }}
      className={cn("h-px from-transparent to-current", side === "left" ? "bg-gradient-to-r" : "bg-gradient-to-l")}
    />
  )
}

function TotalNumber({ roll, moment, reduced }: { roll: Roll; moment: Moment | null; reduced: boolean }) {
  if (moment === "critical") return <CriticalNumber roll={roll} reduced={reduced} />
  if (moment === "fumble") return <FumbleNumber roll={roll} reduced={reduced} />
  return <p className={NUMBER_CLASS}>{reduced ? roll.total : <SlidingNumber value={roll.total} />}</p>
}

// The total with a line either side of it. A normal roll slides in; a critical or a fumble plays its own moment.
export function RollTotal({ roll, moment, reduced }: { roll: Roll; moment: Moment | null; reduced: boolean }) {
  return (
    <div className="flex items-center gap-5">
      <Line side="left" moment={moment} reduced={reduced} />
      <TotalNumber roll={roll} moment={moment} reduced={reduced} />
      <Line side="right" moment={moment} reduced={reduced} />
    </div>
  )
}
