import { NavLink } from "react-router-dom"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { HoverIcon } from "@/components/icons/HoverIcon"
import { cn } from "@/lib/utils"
import type { NavItem } from "./nav-items"
import { useIsActiveRoute } from "./useIsActiveRoute"

type Props = {
  items: NavItem[]
  className?: string
}

export function NavMain({ items, className }: Props) {
  const { isMobile, setOpenMobile, setOpen } = useSidebar()
  const isActive = useIsActiveRoute()

  // Tapping a link on mobile should close the drawer it was tapped in; some pages also
  // fold the sidebar to its icons on desktop.
  const onPick = (item: NavItem) => {
    if (isMobile) setOpenMobile(false)
    else if (item.foldsSidebar) setOpen(false)
  }

  return (
    <SidebarGroup className={cn("px-2", className)}>
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {items.map((item) => (
            <SidebarMenuItem key={item.to}>
              <SidebarMenuButton
                asChild
                className="h-12 pl-[13px] text-[14.5px] group-data-[collapsible=icon]:size-12! group-data-[collapsible=icon]:px-[13px]!"
                tooltip={item.title}
                isActive={isActive(item.to, item.exact)}
              >
                <NavLink to={item.to} onClick={() => onPick(item)}>
                  {/* Lighter lines than the icons' own 2, so they sit back in the rail. */}
                  <HoverIcon icon={item.icon} size={22} delay={200} className={cn("[&_svg]:[stroke-width:1.5]", item.iconClassName)} />
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
              {item.badge && (
                <SidebarMenuBadge className="top-1/2! right-3 -translate-y-1/2">
                  {item.badge}
                </SidebarMenuBadge>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
