import { AnimatePresence, motion } from "motion/react"
import { cn } from "@/lib/utils"
import type { Feature } from "@/lib/quick-card-features"
import { QuickEmptyRow } from "./QuickEmptyRow"
import { QuickFeatureRow } from "./QuickFeatureRow"
import { SWAP } from "./QuickSwap"

type Props = {
  // None while the place is not filled in.
  feature: Feature | undefined
  // Names the row inside the Accordion.
  value: string
  // A place the list has no use for: collapsed to nothing.
  hidden: boolean
  changed: boolean
  onPick: ((pick: string) => void) | null
}

// One place in a section's list, with the divider above it. It is always there: when the list has
// no use for it, it collapses (and grows back when it does), and what is in it crossfades between
// an empty row and a feature.
export function QuickFeatureSlot({ feature, value, hidden, changed, onPick }: Props) {
  return (
    <motion.div
      aria-hidden={hidden || undefined}
      inert={hidden}
      initial={false}
      animate={hidden ? { height: 0, opacity: 0 } : { height: "auto", opacity: 1 }}
      transition={SWAP}
      className={cn("relative overflow-hidden", !hidden && "not-first:border-t")}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div key={feature ? "row" : "empty"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={SWAP}>
          {feature ? <QuickFeatureRow feature={feature} value={value} changed={changed} onPick={onPick} /> : <QuickEmptyRow />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
