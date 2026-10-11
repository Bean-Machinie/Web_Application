import * as React from "react"
import { cn } from "cn"
import { Tooltip as TooltipPrimitive } from "radix-ui"
import { KeyChips } from "@/components/ui/key-chips"

// A tooltip opens after half a second; and once one is open, or has just closed, the
// ones beside it open at once, as you move from one button to the next.
function TooltipProvider({
  delayDuration = 500,
  skipDelayDuration = 600,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
      {...props}
    />
  )
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

// It names something: a short line, and the shortcut as chips at its right ("keys", from
// useShortcutKeys, so they follow the keys the person has chosen).
function TooltipContent({
  className,
  sideOffset = 6,
  collisionPadding = 8,
  keys,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> & { keys?: string[] }) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          "z-50 inline-flex w-fit max-w-[220px] origin-(--radix-tooltip-content-transform-origin) items-center gap-2.5 rounded-md border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1 data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        {...props}
      >
        {children}
        {keys && keys.length > 0 && <KeyChips keys={keys} />}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
