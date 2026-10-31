import { AnimatePresence, motion } from "motion/react"
import type { Feature } from "@/lib/quick-card-features"
import { QuickEmptyRow } from "./QuickEmptyRow"
import { QuickFeatureRow } from "./QuickFeatureRow"
import { SWAP } from "./QuickSwap"

type Props = {
  // None while the place is not filled in.
  feature: Feature | undefined
  // A place the list has no use for: collapsed to nothing.
  hidden: boolean
  changed: boolean
  open: boolean
  onToggle: () => void
  onPick: ((pick: string) => void) | null
}

// One place in a section's list. It is always there: when the list has no use for it, it
// collapses (and grows back when it does), and what is in it crossfades between an empty row and
// a feature.
export function QuickFeatureSlot({ feature, hidden, changed, open, onToggle, onPick }: Props) {
  return (
    <motion.li
      aria-hidden={hidden || undefined}
      inert={hidden}
      initial={false}
      animate={hidden ? { height: 0, opacity: 0 } : { height: "auto", opacity: 1 }}
      transition={SWAP}
      className="relative overflow-hidden"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {feature ? <QuickFeatureRow key="row" feature={feature} changed={changed} open={open} onToggle={onToggle} onPick={onPick} /> : <QuickEmptyRow key="empty" />}
      </AnimatePresence>
    </motion.li>
  )
}
