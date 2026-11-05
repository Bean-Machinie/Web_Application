import type { LucideIcon } from "lucide-react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { FORMAT_BUTTON, FORMAT_BUTTON_ON } from "./format-button-style"
import { leaveTo } from "./format-menu-switch"
import type { MenuControl } from "./format-menu-switch"

type Props = {
  label: string
  icon: LucideIcon
  colors: { label: string; value: string }[]
  // The colour at the selection now, if any.
  current: string | null
  onPick: (color: string | null) => void
  control: MenuControl
  onClosed: () => void
}

// A colour from a handful of swatches, or none; the button shows the colour in use.
export function FormatSwatches({ label, icon: Icon, colors, current, onPick, control, onClosed }: Props) {
  return (
    // Modal like the selects, so that switching between the bar's lists works the same for all.
    <Popover
      modal
      open={control.openId === control.id}
      onOpenChange={(open) => control.choose(open ? control.id : null, control.id)}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className={cn(FORMAT_BUTTON, current && FORMAT_BUTTON_ON)}
              aria-label={label}
              data-format-menu={control.id}
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
        // The text keeps its focus, as it does for bold: moving it into the list and back
        // is when the selection has been seen to change.
        onOpenAutoFocus={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => {
          event.preventDefault()
          leaveTo(event, control)
        }}
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
