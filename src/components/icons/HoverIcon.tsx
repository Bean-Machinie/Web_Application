import type { LucideIcon } from "lucide-react"
import { useEffect, useRef } from "react"
import type { CSSProperties } from "react"
import type { AnimatedIconComponent, IconHandle, IconProps } from "@/components/AnimatedIcon"
import { cn } from "@/lib/utils"

// What "the whole button" is, for an icon inside it.
const HOST = "button, a, [role='menuitem'], [role='option'], label"

type Props = Omit<IconProps, "size"> & {
  // An AnimateIcons icon, or a Lucide one, which sits still.
  icon: AnimatedIconComponent | LucideIcon
  // Leave out to take the size its button gives its icons.
  size?: number
  // Milliseconds the pointer must stay before the icon plays.
  delay?: number
}

// An icon that plays while the button, link or menu row around it is hovered, through the
// icon's handle. Reduced motion is the icon's own business: it does not play.
export function HoverIcon({ icon, size, delay = 0, className, style, ...props }: Props) {
  const Icon = icon as AnimatedIconComponent
  const mark = useRef<HTMLSpanElement>(null)
  const handle = useRef<IconHandle>(null)

  useEffect(() => {
    const host = mark.current?.closest(HOST) ?? mark.current?.firstElementChild
    if (!host) return
    let timer: number | undefined
    const play = () => {
      timer = window.setTimeout(() => handle.current?.startAnimation?.(), delay)
    }
    const rest = () => {
      window.clearTimeout(timer)
      handle.current?.stopAnimation?.()
    }
    host.addEventListener("mouseenter", play)
    host.addEventListener("mouseleave", rest)
    return () => {
      window.clearTimeout(timer)
      host.removeEventListener("mouseenter", play)
      host.removeEventListener("mouseleave", rest)
    }
  }, [delay])

  return (
    <span ref={mark} className="contents">
      <Icon
        ref={handle}
        size={size}
        // A button sizes the svgs inside it with a class, which beats the size attribute.
        className={cn(size && "[&>svg]:size-(--icon-size)!", "shrink-0", className)}
        style={{ "--icon-size": `${size}px`, ...style } as CSSProperties}
        {...props}
      />
    </span>
  )
}
