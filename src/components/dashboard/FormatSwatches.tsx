import type { LucideIcon } from "lucide-react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type Props = {
  label: string
  icon: LucideIcon
  colors: { label: string; value: string }[]
  // The colour at the selection now, if any.
  current: string | null
  onPick: (color: string | null) => void
  onOpenChange: (open: boolean) => void
  onClosed: () => void
}

// A colour from a handful of swatches, or none; the button shows the colour in use.
export function FormatSwatches({ label, icon: Icon, colors, current, onPick, onOpenChange, onClosed }: Props) {
  return (
    <Popover onOpenChange={onOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant={current ? "secondary" : "ghost"}
              size="icon-sm"
              aria-label={label}
              onMouseDown={(event) => event.preventDefault()}
            >
              <span className="flex flex-col items-center gap-px">
                <Icon />
                <span className="h-0.5 w-3.5 rounded-full" style={{ background: current ?? "transparent" }} />
              </span>
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top">{label}</TooltipContent>
      </Tooltip>
      <PopoverContent
        side="bottom"
        sideOffset={6}
        className="w-auto flex-row gap-1.5 p-2"
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          onClosed()
        }}
      >
        {colors.map((color) => (
          <button
            key={color.value}
            type="button"
            aria-label={color.label}
            title={color.label}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onPick(color.value)}
            style={{ background: color.value }}
            className={cn(
              "ring-foreground/20 size-6 rounded-full ring-1 transition-transform hover:scale-110",
              current === color.value && "ring-foreground ring-2"
            )}
          />
        ))}
        <button
          type="button"
          aria-label="None"
          title="None"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onPick(null)}
          className="text-muted-foreground ring-foreground/20 flex size-6 items-center justify-center rounded-full ring-1 hover:scale-110"
        >
          <X className="size-3.5" />
        </button>
      </PopoverContent>
    </Popover>
  )
}
