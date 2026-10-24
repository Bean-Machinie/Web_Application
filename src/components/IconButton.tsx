import { useImperativeHandle, useRef } from "react"
import type { ComponentProps, Ref } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ICON_SIZE } from "./AnimatedIcon"
import type { AnimatedIconComponent, IconHandle } from "./AnimatedIcon"

// No fill when hovered, pressed or open, and no ring: only the icon shows.
const QUIET =
  "hover:bg-transparent active:bg-transparent aria-expanded:bg-transparent data-[state=open]:bg-transparent dark:hover:bg-transparent focus-visible:border-transparent focus-visible:ring-0"

type Props = Omit<ComponentProps<typeof Button>, "children" | "variant" | "size"> & {
  icon: AnimatedIconComponent
  // What it does, for screen readers.
  label: string
  // Play the icon from outside: on the click that opens a menu or a panel.
  animateRef?: Ref<IconHandle>
  // Beside the icon, such as a badge. The button is its positioning box.
  children?: React.ReactNode
}

// The top bar's icon buttons, all one: a 32px square with the icon in the middle at the
// one size every icon has. A little more than the square can be pressed, so the target is
// easy to hit. The icon plays while the whole button is hovered, and when the page plays it.
export function IconButton({
  icon: Icon,
  label,
  animateRef,
  className,
  children,
  onMouseEnter,
  onMouseLeave,
  ...props
}: Props) {
  const icon = useRef<IconHandle>(null)
  useImperativeHandle(
    animateRef,
    () => ({
      startAnimation: () => icon.current?.startAnimation(),
      stopAnimation: () => icon.current?.stopAnimation(),
    }),
    []
  )

  return (
    <Button
      variant="ghost"
      aria-label={label}
      className={cn(
        "relative size-8 p-0 after:absolute after:-inset-1 after:content-['']",
        // A button sizes its svgs with a class, which beats the size attribute.
        "[&_svg:not([class*='size-'])]:size-5",
        QUIET,
        className
      )}
      {...props}
      onMouseEnter={(event) => {
        icon.current?.startAnimation()
        onMouseEnter?.(event)
      }}
      onMouseLeave={(event) => {
        icon.current?.stopAnimation()
        onMouseLeave?.(event)
      }}
    >
      <Icon ref={icon} size={ICON_SIZE} />
      {children}
    </Button>
  )
}
