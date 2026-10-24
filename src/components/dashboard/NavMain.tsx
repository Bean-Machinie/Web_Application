import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { NavMainItem } from "./NavMainItem"
import type { NavItem } from "./nav-items"
import { useIsActiveRoute } from "./useIsActiveRoute"

type Props = {
  items: NavItem[]
  className?: string
}

export function NavMain({ items, className }: Props) {
  const { isMobile, setOpenMobile } = useSidebar()
  const isActive = useIsActiveRoute()

  // Tapping a link on mobile should close the drawer it was tapped in.
  const closeOnMobile = () => isMobile && setOpenMobile(false)

  return (
    <SidebarGroup className={cn("px-2", className)}>
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {items.map((item) => (
            <NavMainItem
              key={item.to}
              item={item}
              active={isActive(item.to, item.exact)}
              onNavigate={closeOnMobile}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
