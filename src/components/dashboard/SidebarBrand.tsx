import { Command, PanelLeftClose, PanelLeftOpen } from "lucide-react"
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
          size="lg"
          onClick={toggleSidebar}
          tooltip={collapsed ? "Expand sidebar" : undefined}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="cursor-pointer pr-3 pl-1.5 group-data-[collapsible=icon]:h-12! group-data-[collapsible=icon]:pl-1.5!"
        >
          <div className="bg-primary text-primary-foreground relative flex size-5 shrink-0 items-center justify-center rounded-md">
            {/* On hover the collapsed logo turns into the expand icon. */}
            <Command className="size-3 transition-opacity group-data-[collapsible=icon]:group-hover/menu-button:opacity-0" />
            <PanelLeftOpen className="absolute size-3 opacity-0 transition-opacity group-data-[collapsible=icon]:group-hover/menu-button:opacity-100" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">Web Application</span>
            <span className="text-muted-foreground truncate text-xs">
              Workspace
            </span>
          </div>
          <PanelLeftClose className="text-muted-foreground ml-auto size-4 shrink-0" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
