import type { LucideIcon } from "lucide-react"
import { ChevronRight } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { QuickSwap, SWAP } from "./QuickSwap"

type Props = {
  icon: LucideIcon
  name: string
  // What it comes to, right-aligned and cut short with an ellipsis; `effect` is muted after it.
  value: string
  effect?: string | null
  // Nothing chosen yet: the value is muted.
  placeholder?: boolean
  // A dot before the value, for what the builder suggested.
  suggested?: boolean
  changed: boolean
  // Fades in and out where it takes the place of another; the place must be in an AnimatePresence.
  animated?: boolean
  open: boolean
  onToggle: () => void
  // What shows when the row is open.
  children: ReactNode
}

// A row of a property list (put it in a list item), about 36px: the icon and name on the left, the state on the right, a
// chevron on hover. It opens in place; Escape or a second click closes it.
export function QuickPropertyRow({ icon: Icon, name, value, effect, placeholder, suggested, changed, animated, open, onToggle, children }: Props) {
  return (
    <motion.div
      initial={animated ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      exit={animated ? { opacity: 0 } : undefined}
      transition={SWAP}
      onKeyDown={(event) => event.key === "Escape" && open && onToggle()}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="group/row hover:bg-accent/60 focus-visible:ring-ring flex h-9 w-full cursor-pointer items-center gap-2 rounded-[4px] px-2 text-left text-[13px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset"
      >
        <Icon aria-hidden className="text-muted-foreground size-4 shrink-0" strokeWidth={1.5} />
        <span className="text-foreground flex shrink-0"><QuickSwap text={name} className="px-0" /></span>
        <span className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
          {suggested && <span aria-label="Suggested" className="bg-foreground/60 size-1.5 shrink-0 rounded-full" />}
          <span className="flex min-w-0 items-center">
            {value && <QuickSwap text={value} changed={changed} className={cn("-mr-1", placeholder ? "text-muted-foreground" : "text-foreground")} />}
            {effect && <span className="text-muted-foreground shrink-0 pl-1">· {effect}</span>}
          </span>
        </span>
        <ChevronRight aria-hidden className={cn("text-muted-foreground size-3.5 shrink-0 opacity-0 transition-[opacity,transform] group-hover/row:opacity-100 group-focus-visible/row:opacity-100", open && "rotate-90 opacity-100")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={SWAP} className="overflow-hidden">
            <div className="flex flex-col items-start gap-2 pt-1 pr-2 pb-3 pl-8">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
