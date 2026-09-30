import { NavLink } from "react-router-dom"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Icon } from "@/components/Icon"
import type { NavGroup } from "./nav-items"
import { useIsActiveRoute } from "./useIsActiveRoute"

export function NavMain({ group }: { group: NavGroup }) {
  const { isMobile, setOpenMobile } = useSidebar()
  const isActive = useIsActiveRoute()

  // Tapping a link on mobile should close the drawer it was tapped in.
  const closeOnMobile = () => isMobile && setOpenMobile(false)

  return (
    <SidebarGroup className="px-2">
      {/* Keep the label's height when collapsed so icons don't jump vertically. */}
      <SidebarGroupLabel className="text-[12.5px] group-data-[collapsible=icon]:mt-0!">
        {group.label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {group.items.map((item) => (
            <SidebarMenuItem key={item.to}>
              <SidebarMenuButton
                asChild
                className="h-12 pl-[15px] text-[14.5px] group-data-[collapsible=icon]:size-12! group-data-[collapsible=icon]:px-[15px]!"
                tooltip={item.title}
                isActive={isActive(item.to, item.to === "/app")}
              >
                <NavLink to={item.to} onClick={closeOnMobile}>
                  <Icon src={item.icon} className="size-[18px]" />
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
              {item.badge && <SidebarMenuBadge className="top-1/2! right-3 -translate-y-1/2">{item.badge}</SidebarMenuBadge>}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
