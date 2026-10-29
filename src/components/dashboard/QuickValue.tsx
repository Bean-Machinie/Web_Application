import { motion } from "motion/react"
import { cn } from "@/lib/utils"

// A value of the character card. A new value slides in where the old one was, and one that
// differs from the committed card is highlighted.
export function QuickValue({ value, changed, className }: { value: string; changed: boolean; className?: string }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={cn("inline-block rounded px-1 tabular-nums transition-colors", changed ? "bg-accent text-accent-foreground ring-foreground/20 font-semibold ring-1" : "ring-transparent", className)}
    >
      {value}
    </motion.span>
  )
}
