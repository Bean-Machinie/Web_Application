import { useState } from "react"
import { Link } from "react-router-dom"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
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

// Open, the logo leads to the campaigns home and the icon at the right
// collapses the sidebar. Collapsed, the logo expands it again.
export function SidebarBrand() {
  const { state, toggleSidebar, isMobile, setOpenMobile } = useSidebar()
  const collapsed = state === "collapsed"
  // After clicking to collapse, the pointer is still over the logo. The
  // expand icon should wait until the pointer has left and come back.
  const [justCollapsed, setJustCollapsed] = useState(false)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          tooltip="Expand sidebar"
          className="h-[52px] cursor-pointer pr-10 pl-[7.5px] group-data-[collapsible=icon]:size-[52px]! group-data-[collapsible=icon]:px-[7.5px]!"
        >
          <Link
            to="/app"
            aria-label={collapsed ? "Expand sidebar" : "All campaigns"}
            onClick={(event) => {
              if (collapsed) {
                // Collapsed, the logo is a button for opening the sidebar.
                event.preventDefault()
                toggleSidebar()
              } else if (isMobile) {
                setOpenMobile(false)
              }
            }}
            onMouseLeave={() => setJustCollapsed(false)}
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
              <PanelLeftOpen
                className={cn(
                  "absolute size-4 opacity-0 transition-opacity",
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
          </Link>
        </SidebarMenuButton>
        <button
          type="button"
          aria-label="Collapse sidebar"
          onClick={() => {
            setJustCollapsed(true)
            toggleSidebar()
          }}
          className="text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-sidebar-ring absolute top-1/2 right-2 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md outline-hidden focus-visible:ring-2 group-data-[collapsible=icon]:hidden"
        >
          <PanelLeftClose className="size-4" />
        </button>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
