import type { ReactNode } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type Props = {
  label: string
  active: boolean
  onClick: () => void
  // The shortcut, as chips in the tooltip: ["B"].
  keys?: string[]
  disabled?: boolean
  // The icon, and anything laid over it, like a badge.
  children: ReactNode
}

// A button of the builder's icon rail: the width, colour and buttons of the dashboard's sidebar
// when it is put away (see ui/sidebar.tsx and NavMain), square 48 pixel buttons with 18 pixel
// icons, 4 apart, with the name and key in a tooltip beside it.
export function BuilderRailButton({ label, active, onClick, keys, disabled, children }: Props) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          data-active={active}
          className="ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground relative flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-md outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-[18px] [&_svg]:shrink-0"
          aria-label={label}
          aria-pressed={active}
          disabled={disabled}
          onClick={onClick}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" keys={keys}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}
