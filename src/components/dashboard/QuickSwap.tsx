import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

// The same ease and length as the words of the sentence.
export const SWAP = { duration: 0.18, ease: [0.2, 0, 0, 1] as const }

type Props = { text: string; changed?: boolean; className?: string; wrap?: boolean }

// Text in a place that stays: when it changes, the old fades and blurs out and the new in over it,
// as the sentence's words do; with `wrap` a long one wraps instead of being cut short. One that differs from the committed card is highlighted.
export function QuickSwap({ text, changed, className, wrap }: Props) {
  const reduced = useReducedMotion()
  const blur = reduced ? {} : { filter: "blur(2px)" }
  return (
    <span className={cn("relative inline-flex max-w-full rounded px-1 transition-[background-color,box-shadow] duration-200", changed ? "bg-accent text-accent-foreground ring-foreground/20 font-semibold ring-1" : "ring-1 ring-transparent", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={text}
          initial={{ opacity: 0, ...blur }}
          animate={{ opacity: 1, filter: reduced ? undefined : "blur(0px)" }}
          exit={{ opacity: 0, ...blur }}
          transition={reduced ? { duration: 0 } : SWAP}
          className={cn("block max-w-full", !wrap && "truncate")}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
