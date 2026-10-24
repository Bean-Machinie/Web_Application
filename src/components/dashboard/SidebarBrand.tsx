import { useState } from "react"
import { HoverIcon } from "@/components/icons/HoverIcon"
import { PanelLeftCloseIcon } from "@/components/icons/PanelLeftCloseIcon"
import { PanelLeftOpenIcon } from "@/components/icons/PanelLeftOpenIcon"
import blackName from "@/assets/logo/Black/HELIOSYN_Name_Black.png"
import whiteName from "@/assets/logo/White/HELIOSYN_Name_White.png"
import { LogoMark } from "@/components/LogoMark"
import { cn } from "@/lib/utils"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function SidebarBrand() {
  const { state, toggleSidebar } = useSidebar()
  const collapsed = state === "collapsed"
  // After clicking to collapse, the pointer is still over the button. The
  // expand icon should wait until the pointer has left and come back.
  const [justCollapsed, setJustCollapsed] = useState(false)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => {
            if (!collapsed) setJustCollapsed(true)
            toggleSidebar()
          }}
          onMouseLeave={() => setJustCollapsed(false)}
          tooltip="Expand sidebar"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="h-[52px] cursor-pointer pr-2.5 pl-[7.5px] group-data-[collapsible=icon]:size-[52px]! group-data-[collapsible=icon]:px-[7.5px]!"
        >
          <div className="relative flex size-[37px] shrink-0 items-center justify-center">
            {/* On hover the collapsed logo turns into the expand icon. */}
            <LogoMark
              className={cn(
                "size-[41px] max-w-none shrink-0 transition-opacity",
                !justCollapsed &&
                  "group-data-[collapsible=icon]:group-hover/menu-button:opacity-0"
              )}
            />
            <HoverIcon
              icon={PanelLeftOpenIcon}
              size={16}
              className={cn(
                "absolute opacity-0 transition-opacity",
                !justCollapsed &&
                  "group-data-[collapsible=icon]:group-hover/menu-button:opacity-100"
              )}
            />
          </div>
          {/* Fades rather than resizing, so it never looks stretched mid-animation. */}
          <div className="-ml-3.5 flex flex-1 items-center transition-opacity duration-200 ease-linear group-data-[collapsible=icon]:opacity-0">
            <img draggable={false}
              src={blackName}
              alt="Heliosyn"
              className="h-[37px] max-w-none shrink-0 dark:hidden"
            />
            <img draggable={false}
              src={whiteName}
              alt="Heliosyn"
              className="hidden h-[37px] max-w-none shrink-0 dark:block"
            />
          </div>
          <HoverIcon icon={PanelLeftCloseIcon} size={16} className="text-muted-foreground ml-auto" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
