import type { ComponentProps } from "react"
import type { AnimatedIconComponent } from "@/components/AnimatedIcon"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useIconHover } from "@/hooks/use-icon-hover"

type Props = ComponentProps<typeof DropdownMenuItem> & { icon: AnimatedIconComponent }

// A menu row whose icon plays while the row is hovered.
export function IconMenuItem({ icon: Icon, children, ...props }: Props) {
  const { icon, hover } = useIconHover()

  return (
    <DropdownMenuItem {...hover} {...props}>
      <Icon ref={icon} size={16} className="shrink-0" />
      {children}
    </DropdownMenuItem>
  )
}
