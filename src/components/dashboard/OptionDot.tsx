import type { Tone } from "@/lib/world-kinds"
import { cn } from "@/lib/utils"

const TONES: Record<Tone, string> = {
  positive: "bg-emerald-500",
  neutral: "bg-muted-foreground/50",
  negative: "bg-red-500",
  warning: "bg-amber-500",
}

export function OptionDot({ tone = "neutral" }: { tone?: Tone }) {
  return <span aria-hidden className={cn("size-2 shrink-0 rounded-full", TONES[tone])} />
}
