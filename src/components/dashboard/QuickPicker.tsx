import type { ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"
import { QUICK_KINDS } from "@/lib/quick-options"
import type { Slot } from "@/lib/quick-slots"
import type { SheetActions } from "./character-actions"
import { QuickDetail } from "./QuickDetail"
import { QuickGrid } from "./QuickGrid"

type Props = {
  // The slot whose options are shown, or none.
  slot: Slot | null
  // The option being hovered or focused.
  previewId: string | null
  actions: SheetActions
  // Shown when no slot is open.
  idle: ReactNode
  onSelect: (id: string) => void
  onLearn: (id: string) => void
  onPreview: (id: string | null) => void
}

// The left of the workspace: the grid of options of the open slot, with the detail of the
// option under it. With no slot open, it holds `idle`: a hint, or the review.
export function QuickPicker({ slot, previewId, actions, idle, onSelect, onLearn, onPreview }: Props) {
  const kind = QUICK_KINDS.find((candidate) => candidate === slot?.kind)

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={slot?.id ?? "idle"}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.12 }}
        className="flex min-w-0 flex-col gap-4"
      >
        {slot ? (
          <>
            <QuickGrid slot={slot} onSelect={onSelect} onLearn={onLearn} onPreview={onPreview} />
            {kind && <QuickDetail kind={kind} id={previewId ?? slot.chosen} actions={actions} />}
          </>
        ) : (
          idle
        )}
      </motion.div>
    </AnimatePresence>
  )
}
