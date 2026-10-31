import type { LucideIcon } from "lucide-react"
import { motion } from "motion/react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { QuickSwap, SWAP } from "./QuickSwap"

type Props = {
  icon: LucideIcon
  // What is picked ("Fighter"), or what the section is.
  title: string
  // Under it, in muted text: the category and the key facts ("Class · Level 1 · d10").
  subtitle: string
  // Nothing is picked yet: the title is a muted prompt.
  placeholder?: boolean
  // Makes the whole header a button that opens its picker.
  onOpen?: (() => void) | null
  // Eases in from just above its place when it is added to the list; the list must be in an AnimatePresence.
  reveal?: boolean
  children?: ReactNode
}

// A section of the character panel, straight on the panel: a header (a 32px icon in a rounded
// square, the title and a line of facts) and its rows under it. A full-width line, 24px clear on
// both sides, separates it from the one above.
export function QuickSection({ icon: Icon, title, subtitle, placeholder, onOpen, reveal, children }: Props) {
  const head = (
    <>
      <span aria-hidden className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4">
        <Icon strokeWidth={1.5} />
      </span>
      <span className="flex min-w-0 flex-col text-left">
        <span className={cn("text-sm", placeholder ? "text-muted-foreground font-normal" : "text-foreground font-semibold")}>
          <QuickSwap text={title} className="px-0" />
        </span>
        <span className="text-muted-foreground text-xs">
          <QuickSwap text={subtitle} className="px-0" />
        </span>
      </span>
    </>
  )

  return (
    <motion.section
      aria-label={title}
      initial={reveal ? { opacity: 0, y: -8 } : false}
      animate={{ opacity: 1, y: 0 }}
      exit={reveal ? { opacity: 0 } : undefined}
      transition={{ ...SWAP, duration: 0.28 }}
      className="flex flex-col gap-2 not-first:-mr-2 not-first:-ml-4 not-first:mt-6 not-first:border-t not-first:pt-6 not-first:pr-2 not-first:pl-4"
    >
      {onOpen ? (
        <button type="button" onClick={onOpen} className="hover:bg-accent focus-visible:ring-ring -mx-2 flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 outline-none transition-colors focus-visible:ring-2">
          {head}
        </button>
      ) : (
        <div className="-mx-2 flex items-center gap-3 px-2 py-1.5">{head}</div>
      )}
      {children}
    </motion.section>
  )
}
