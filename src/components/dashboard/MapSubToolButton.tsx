import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type Props = {
  label: string
  hint: string
  active: boolean
  onClick: () => void
  // The icon or stroke that stands for the sub tool.
  children: ReactNode
}

// One row of the sub tool list: a picture and a name.
export function MapSubToolButton({ label, hint, active, onClick, children }: Props) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={active ? "secondary" : "ghost"}
          size="lg"
          aria-pressed={active}
          className="justify-start gap-2.5"
          onClick={onClick}
        >
          {children}
          {label}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">{hint}</TooltipContent>
    </Tooltip>
  )
}
