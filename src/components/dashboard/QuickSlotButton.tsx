import { motion } from "motion/react"
import { cn } from "@/lib/utils"

type Props = { label: string | null; placeholder: string; chosenId: string | null; slotId: string; open: boolean; onClick: () => void }

// One bracket of the sentence. Empty, it is a dashed outline holding the placeholder word;
// filled, a solid one holding the name. The solid surface shares its layoutId with the
// option card it was chosen from, so the card settles into the sentence.
export function QuickSlotButton({ label, placeholder, chosenId, slotId, open, onClick }: Props) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-label={label ? `${placeholder}: ${label}. Change` : `Choose ${placeholder}`}
      onClick={onClick}
      className={cn(
        "focus-visible:ring-ring relative inline-block rounded-xl border-2 px-3 align-baseline outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        label ? "border-transparent" : "text-muted-foreground border-dashed",
        open ? "border-foreground" : !label && "border-muted-foreground/50 hover:border-foreground/70"
      )}
    >
      {label && chosenId && <motion.span layoutId={`surface:${slotId}:${chosenId}`} className="bg-foreground absolute -inset-0.5 rounded-xl" />}
      <span className={cn("relative", label && "text-background")}>{label ?? placeholder}</span>
    </button>
  )
}
