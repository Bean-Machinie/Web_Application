import * as React from "react"
import { cn } from "cn"
import { Tooltip as TooltipPrimitive } from "radix-ui"
import { KeyChips } from "@/components/ui/key-chips"

// A tooltip opens after a wait. But once one has been open, and for a moment after it has
// closed, the next opens after a much shorter one: moving over a row of buttons, the
// first takes its time, and the rest follow quickly, though never at once. Radix can
// only skip the wait altogether, so the two waits are given to each tooltip here, from
// whether any has just been open.
const FIRST_WAIT_MS = 700
const NEXT_WAIT_MS = 150
// How long after the last one closes the next still comes quickly.
const WARM_FOR_MS = 900

let warm = false
let cooling: number | undefined
const watchers = new Set<() => void>()

function setWarm(next: boolean) {
  if (warm === next) return
  warm = next
  watchers.forEach((watcher) => watcher())
}

function track(open: boolean) {
  window.clearTimeout(cooling)
  if (open) setWarm(true)
  else cooling = window.setTimeout(() => setWarm(false), WARM_FOR_MS)
}

const watch = (watcher: () => void) => {
  watchers.add(watcher)
  return () => {
    watchers.delete(watcher)
  }
}

// A tooltip is not something to move onto, so it goes as soon as the pointer leaves its
// button ("disableHoverableContent"): otherwise it stays open while the pointer crosses the
// space between the two, and holds back the next one, which on buttons side by side
// is the next button's own.
function TooltipProvider({
  delayDuration = FIRST_WAIT_MS,
  skipDelayDuration = 0,
  disableHoverableContent = true,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
      disableHoverableContent={disableHoverableContent}
      {...props}
    />
  )
}

function Tooltip({
  delayDuration,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  const recently = React.useSyncExternalStore(watch, () => warm)
  return (
    <TooltipPrimitive.Root
      data-slot="tooltip"
      delayDuration={delayDuration ?? (recently ? NEXT_WAIT_MS : FIRST_WAIT_MS)}
      onOpenChange={(open) => {
        track(open)
        onOpenChange?.(open)
      }}
      {...props}
    />
  )
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
