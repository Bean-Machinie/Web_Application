import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { FORMAT_BUTTON } from "./format-button-style"
import { leaveTo } from "./format-menu-switch"
import type { MenuControl } from "./format-menu-switch"

type Props = {
  label: string
  icon: LucideIcon
  control: MenuControl
  onClosed: () => void
  // For a list of plain choices: the text keeps its focus, and so its selection. A list
  // with a field to type in needs the focus itself.
  keepTextFocus?: boolean
  children: ReactNode
}

// An icon button of the format bar that opens a list under it, set like the selects:
// the same panel, shadow and fade. Modal, so that moving to another list is one step.
export function FormatPopover({ label, icon: Icon, control, onClosed, keepTextFocus, children }: Props) {
  return (
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
              className={FORMAT_BUTTON}
              aria-label={label}
              data-format-menu={control.id}
              onMouseDown={(event) => event.preventDefault()}
            >
              <Icon />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top">{label}</TooltipContent>
      </Tooltip>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={6}
        className="w-64 gap-0 overflow-hidden p-0 shadow-lg"
        onOpenAutoFocus={(event) => keepTextFocus && event.preventDefault()}
        onPointerDownOutside={(event) => {
          event.preventDefault()
          leaveTo(event, control)
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          onClosed()
        }}
      >
        {children}
      </PopoverContent>
    </Popover>
  )
}
