import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

// The way back to the number the builder suggested, shown on an ability that is not at it.
export function QuickScoreReset({ label, suggested, onReset }: { label: string; suggested: number; onReset: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-xs" aria-label={`Use suggested ${label}`} className="text-muted-foreground size-5" onClick={onReset}>
          <RotateCcw className="size-3" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Use suggested ({suggested})</TooltipContent>
    </Tooltip>
  )
}
