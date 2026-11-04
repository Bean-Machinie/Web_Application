import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

type Props = ComponentProps<"button"> & { active?: boolean }

// An item of the rail, drawn as the main sidebar draws one in icon mode: 32px, the same
// radius, hover and active colours, and ring. It forwards what a tooltip, hover card
// or menu trigger gives it.
export function JournalRailButton({ active = false, className, ...props }: Props) {
  return (
    <button
      type="button"
      data-active={active || undefined}
      className={cn(
        "ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground flex size-8 shrink-0 items-center justify-center rounded-md p-2 text-sm outline-hidden focus-visible:ring-2 data-active:font-medium [&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
}
