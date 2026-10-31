import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type Props = {
  value: string
  // A pick the player made has a solid outline, one the builder suggested a dashed one.
  suggested: boolean
  chosen?: boolean
  // Opens the panel of the pick; none, and the pill is only a label.
  onClick: (() => void) | null
}

const LOOK = "bg-muted/60 text-foreground inline-flex items-center rounded-[4px] border px-2 py-0.5 text-left text-[13px] font-medium"

// A value the player can choose, as a small button: it opens the panel that changes it.
export function QuickChoicePill({ value, suggested, chosen = true, onClick }: Props) {
  const outline = suggested ? "border-dashed border-foreground/40" : "border-foreground/40"
  if (!onClick) return <span className={cn(LOOK, outline)}>{value}</span>

  const hint = !chosen ? "Not chosen · click to choose" : suggested ? "Suggested · click to change" : "Your choice · click to change"
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" onClick={onClick} className={cn(LOOK, outline, "hover:bg-muted focus-visible:ring-ring cursor-pointer outline-none transition-colors focus-visible:ring-2")}>
          {value}
        </button>
      </TooltipTrigger>
      <TooltipContent>{hint}</TooltipContent>
    </Tooltip>
  )
}
