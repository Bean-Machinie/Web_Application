import { motion } from "motion/react"
import { TextEffect } from "@/components/TextEffect"
import type { Moment } from "@/lib/dice-result"

const WORDS = { critical: "Critical", fumble: "Fumble" }
const SMALL_CAPS = "text-xs font-medium uppercase"

// "CRITICAL" appears letter by letter as the spacing closes up; "FUMBLE" fades in and drifts down.
export function MomentWord({ moment, reduced }: { moment: Moment; reduced: boolean }) {
  if (reduced) return <p className={`${SMALL_CAPS} tracking-[0.3em] ${moment === "fumble" ? "opacity-70" : ""}`}>{WORDS[moment]}</p>
  if (moment === "critical") {
    return (
      <p className={SMALL_CAPS}>
        <TextEffect text={WORDS.critical} delay={0.4} from="0.6em" to="0.3em" />
      </p>
    )
  }
  return (
    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 0.7, y: 0 }} transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }} className={`${SMALL_CAPS} tracking-[0.3em]`}>
      {WORDS.fumble}
    </motion.p>
  )
}
