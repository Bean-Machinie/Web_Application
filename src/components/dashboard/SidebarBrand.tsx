import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
import blackName from "@/assets/logo/Black/HELIOSYN_Name_Black.png"
import whiteName from "@/assets/logo/White/HELIOSYN_Name_White.png"
import { LogoMark } from "@/components/LogoMark"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function SidebarBrand() {
  const { state, toggleSidebar } = useSidebar()
  const collapsed = state === "collapsed"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={toggleSidebar}
          tooltip={collapsed ? "Expand sidebar" : undefined}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="h-10 cursor-pointer pr-3 pl-1 group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:px-1!"
        >
          <div className="relative flex size-8 shrink-0 items-center justify-center">
            {/* On hover the collapsed logo turns into the expand icon. */}
            <LogoMark className="size-9 max-w-none shrink-0 transition-opacity group-data-[collapsible=icon]:group-hover/menu-button:opacity-0" />
            <PanelLeftOpen className="absolute size-4 opacity-0 transition-opacity group-data-[collapsible=icon]:group-hover/menu-button:opacity-100" />
          </div>
          {/* Fades rather than resizing, so it never looks stretched mid-animation. */}
          <div className="flex flex-1 items-center transition-opacity delay-100 duration-200 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:delay-0 group-data-[collapsible=icon]:duration-75">
            <img
              src={blackName}
              alt="Heliosyn"
              className="h-8 max-w-none shrink-0 dark:hidden"
            />
            <img
              src={whiteName}
              alt="Heliosyn"
              className="hidden h-8 max-w-none shrink-0 dark:block"
            />
          </div>
          <PanelLeftClose className="text-muted-foreground ml-auto size-4 shrink-0" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
