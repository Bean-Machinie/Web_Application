import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { AccountMenu } from "./AccountMenu"
import { AccountButtonBody } from "./AccountButtonBody"

export function NavUser() {
  const { state, isMobile, setOpenMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <AccountMenu
          side="top"
          align={state === "collapsed" ? "start" : "end"}
          // Same as the nav links: a tap on mobile closes the drawer.
          onChoose={() => isMobile && setOpenMobile(false)}
        >
          <SidebarMenuButton size="lg" className="cursor-pointer h-[52px] pr-3 pl-2.5 group-data-[collapsible=icon]:size-[52px]! group-data-[collapsible=icon]:px-2.5!">
            <AccountButtonBody />
          </SidebarMenuButton>
        </AccountMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
