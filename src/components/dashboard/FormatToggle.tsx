import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type Props = { label: string; icon: LucideIcon; active: boolean; onClick: () => void }

// One on-or-off button of the format bar.
export function FormatToggle({ label, icon: Icon, active, onClick }: Props) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={active ? "secondary" : "ghost"}
          size="icon-sm"
          aria-label={label}
          aria-pressed={active}
          // Keeps the selection in the text while it is pressed.
          onMouseDown={(event) => event.preventDefault()}
          onClick={onClick}
        >
          <Icon />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  )
}
