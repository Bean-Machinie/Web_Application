import type { Tone } from "@/lib/world-kinds"
import { cn } from "@/lib/utils"

// Deeper in light, where the pale shades vanish on the page.
const TONES: Record<Tone, string> = {
  positive: "bg-emerald-600 dark:bg-emerald-500",
  neutral: "bg-muted-foreground",
  negative: "bg-red-600 dark:bg-red-500",
  warning: "bg-amber-600 dark:bg-yellow-400",
}

export function OptionDot({ tone = "neutral", className }: { tone?: Tone; className?: string }) {
  return <span aria-hidden className={cn("size-2 shrink-0 rounded-full", TONES[tone], className)} />
}
