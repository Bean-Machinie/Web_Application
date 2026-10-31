import { motion } from "motion/react"
import { SWAP } from "./QuickSwap"

// The place of a row that is not filled in yet: the same 36px, with faint bars where its icon,
// name and value will be.
export function QuickEmptyRow() {
  return (
    <motion.div aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={SWAP} className="flex h-9 items-center gap-2 px-2">
      <span className="bg-muted size-4 shrink-0 rounded-[4px]" />
      <span className="bg-muted h-2 w-20 rounded-[4px]" />
      <span className="bg-muted/60 ml-auto h-2 w-14 rounded-[4px]" />
    </motion.div>
  )
}
