import { HoverIcon } from "@/components/icons/HoverIcon"
import { SearchIcon } from "@/components/icons/SearchIcon"
import { KeyChips } from "@/components/ui/key-chips"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { MODIFIER_KEY } from "@/lib/selection-hint"
import { useCommandPalette } from "./useCommandPalette"

// The home sidebar's top row. It is the same height as the campaign header, so
// the nav below does not move between the two.
export function SidebarSearch() {
  const { open } = useCommandPalette()

  return (
    <SidebarGroup className="px-2">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            tooltip="Search"
            onClick={open}
            className="relative h-14 min-h-14 p-0! hover:bg-transparent group-data-[collapsible=icon]:size-12! group-data-[collapsible=icon]:hover:bg-sidebar-accent"
          >
            {/* The pill keeps the open sidebar's width and is only clipped when
                collapsed, so nothing moves; its icon sits at the collapsed centre. */}
            <span className="group-hover/menu-button:bg-sidebar-accent text-muted-foreground absolute top-1/2 left-1.5 flex h-9 w-[calc(var(--sidebar-width)-1.75rem)] -translate-y-1/2 items-center gap-2 rounded-lg border px-2.5 transition-colors group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:group-hover/menu-button:bg-transparent">
              <HoverIcon icon={SearchIcon} size={16} delay={200} />
              <span className="flex-1 text-[14.5px] transition-opacity duration-200 ease-linear group-data-[collapsible=icon]:opacity-0">
                Search…
              </span>
              <KeyChips
                keys={[MODIFIER_KEY, "K"]}
                className="transition-opacity duration-200 ease-linear group-data-[collapsible=icon]:opacity-0"
              />
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
