import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type Props = { label: string; onClick: () => void; children: React.ReactNode }

// A square icon button at the end of a floating card's header bar, set apart from
// what is before it by a fine line.
export function MapCardButton({ label, onClick, children }: Props) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={label}
          onClick={onClick}
          className="text-muted-foreground size-auto h-full w-8 shrink-0 rounded-none border-l"
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  )
}
