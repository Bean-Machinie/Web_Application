import { Check } from "lucide-react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

type Props = { number: number; state: "complete" | "current" | "upcoming" }

// The 22px circle of a step. The ring is shared by layoutId, so it glides to whichever step opens.
export function BuilderStepMarker({ number, state }: Props) {
  return (
    <span
      className={cn(
        "relative flex size-[22px] shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-semibold transition-colors",
        state === "complete" && "bg-primary border-primary text-primary-foreground",
        state === "current" && "border-primary text-primary bg-background",
        state === "upcoming" && "border-border text-muted-foreground bg-background"
      )}
    >
      {state === "current" && (
        <motion.span
          layoutId="builder-step-ring"
          className="ring-primary/20 absolute -inset-[3px] rounded-full ring-[3px]"
          transition={{ type: "spring", stiffness: 500, damping: 36 }}
        />
      )}
      {state === "complete" ? (
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}>
          <Check className="size-3" strokeWidth={3} />
        </motion.span>
      ) : (
        number
      )}
    </span>
  )
}
