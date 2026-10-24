import { useRef } from "react"
import type { IconHandle } from "@/components/AnimatedIcon"

// For an icon inside something that is not an IconButton, such as a menu row: spread
// `hover` on the whole row so the icon plays when the row is hovered, not only the icon.
export function useIconHover() {
  const icon = useRef<IconHandle>(null)
  const hover = {
    onMouseEnter: () => icon.current?.startAnimation(),
    onMouseLeave: () => icon.current?.stopAnimation(),
  }
  return { icon, hover }
}
