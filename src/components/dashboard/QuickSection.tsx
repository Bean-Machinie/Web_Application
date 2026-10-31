import { motion } from "motion/react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { QuickSwap, SWAP } from "./QuickSwap"

type Props = {
  label: string
  // What is picked for it ("Fighter"); a button that opens its picker when `onOpen` is given.
  name?: string
  // Nothing is picked yet: the name is a muted prompt.
  placeholder?: boolean
  onOpen?: (() => void) | null
  // At the right end of the header: the level, a pencil.
  end?: ReactNode
  // Eases in from just above its place when it is added to the list; the list must be in an AnimatePresence.
  reveal?: boolean
  children: ReactNode
}

// A section of the character panel, straight on the panel: a header on one line (a small uppercase
// label, then the name picked) and its rows under it. A full-width line, 20px clear on both sides,
// separates it from the one above.
export function QuickSection({ label, name, placeholder, onOpen, end, reveal, children }: Props) {
  return (
    <motion.section
      aria-label={name ? `${label}: ${name}` : label}
      initial={reveal ? { opacity: 0, y: -8 } : false}
      animate={{ opacity: 1, y: 0 }}
      exit={reveal ? { opacity: 0 } : undefined}
      transition={{ ...SWAP, duration: 0.28 }}
      className="flex flex-col gap-3.5 not-first:-mr-2 not-first:-ml-4 not-first:mt-5 not-first:border-t not-first:pt-5 not-first:pr-2 not-first:pl-4"
    >
      <header className="flex items-baseline justify-between gap-3">
        <h3 className="flex items-baseline gap-2.5">
          <span className="text-muted-foreground text-[11px] tracking-widest uppercase">{label}</span>
          {name && (onOpen ? (
            // The padding is taken back by the margin, so the name does not move.
            <button type="button" onClick={onOpen} className={cn("hover:bg-accent focus-visible:ring-ring -mx-1.5 -my-0.5 cursor-pointer rounded-[4px] px-1.5 py-0.5 text-[15px] outline-none transition-colors focus-visible:ring-2", placeholder ? "text-muted-foreground font-normal" : "text-foreground font-semibold")}>
              <QuickSwap text={name} className="px-0" />
            </button>
          ) : (
            <span className="text-foreground text-[15px] font-semibold">{name}</span>
          ))}
        </h3>
        {end}
      </header>
      {children}
    </motion.section>
  )
}
