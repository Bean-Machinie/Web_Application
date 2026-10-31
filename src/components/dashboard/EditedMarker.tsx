import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type Props = {
  // What the calculation gives, said in the button's tooltip; null when it cannot be worked out.
  calculated: string | null
  onReset: () => void
}

// Marks a value the player has typed over a calculated one: a muted "Edited", and the button that
// brings the calculated one back.
export function EditedMarker({ calculated, onReset }: Props) {
  return (
    <span className="inline-flex shrink-0 items-center gap-0.5">
      <span className="text-muted-foreground text-[10px] leading-none">Edited</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-xs" aria-label="Edited. Use calculated" className="text-muted-foreground size-5" onClick={onReset}>
            <RotateCcw className="size-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{calculated === null ? "Use calculated" : `Use calculated (${calculated})`}</TooltipContent>
      </Tooltip>
    </span>
  )
}
