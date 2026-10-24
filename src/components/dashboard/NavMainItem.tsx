import { NavLink } from "react-router-dom"
import { SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { useIconHover } from "@/hooks/use-icon-hover"
import type { NavItem } from "./nav-items"

type Props = {
  item: NavItem
  active: boolean
  onNavigate: () => void
}

export function NavMainItem({ item, active, onNavigate }: Props) {
  const { icon, hover } = useIconHover()

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        className="h-12 pl-[15px] text-[14.5px] group-data-[collapsible=icon]:size-12! group-data-[collapsible=icon]:px-[15px]!"
        tooltip={item.title}
        isActive={active}
        {...hover}
      >
        <NavLink to={item.to} onClick={onNavigate}>
          <item.icon ref={icon} size={18} className="shrink-0" />
          <span>{item.title}</span>
        </NavLink>
      </SidebarMenuButton>
      {item.badge && (
        <SidebarMenuBadge className="top-1/2! right-3 -translate-y-1/2">{item.badge}</SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  )
}
