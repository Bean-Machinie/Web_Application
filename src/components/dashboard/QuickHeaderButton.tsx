import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type Props = {
  icon: LucideIcon
  text: string
  // What it does, said on hover.
  tip: string
  disabled: boolean
  onClick: () => void
}

// A button of the toolbar, as the Filter button of the collection pages is: outline, a static icon and
// text. The span carries the tooltip so that it shows while the button is disabled.
export function QuickHeaderButton({ icon: Icon, text, tip, disabled, onClick }: Props) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          <Button variant="outline" disabled={disabled} onClick={onClick}>
            <Icon />
            {text}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>{tip}</TooltipContent>
    </Tooltip>
  )
}
