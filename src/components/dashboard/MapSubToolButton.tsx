import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type Props = {
  label: string
  // Only said when it adds to the label: a row with its name showing needs none.
  hint?: string
  // A small muted line under the name.
  detail?: string
  active: boolean
  onClick: () => void
  onContextMenu?: (event: React.MouseEvent) => void
  // Rows with a picture in place of an icon are taller.
  tall?: boolean
  // The icon or stroke that stands for the sub tool.
  children: ReactNode
}

// One row of the sub tool list: a picture and a name.
export function MapSubToolButton({ label, hint, detail, active, tall, onClick, onContextMenu, children }: Props) {
  const row = (
    <Button
      variant={active ? "secondary" : "ghost"}
      size="lg"
      aria-pressed={active}
      className={`justify-start gap-2.5 ${tall ? "h-11 gap-2 px-2" : ""}`}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      {children}
      <span className="grid min-w-0 text-left">
        {label}
        {detail && <span className="text-muted-foreground text-[10px] leading-tight font-normal">{detail}</span>}
      </span>
    </Button>
  )
  if (!hint) return row
  return (
    <Tooltip>
      <TooltipTrigger asChild>{row}</TooltipTrigger>
      <TooltipContent side="right">{hint}</TooltipContent>
    </Tooltip>
  )
}
