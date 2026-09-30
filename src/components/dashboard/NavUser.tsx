import { useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/auth/useAuth"
import logout from "@/assets/icons/menu-logout.svg"
import desktop from "@/assets/icons/desktop.svg"
import file from "@/assets/icons/file.svg"
import lifeBuoy from "@/assets/icons/life-buoy.svg"
import settings from "@/assets/icons/settings.svg"
import { Icon } from "@/components/Icon"
import { MenuChevron } from "./MenuChevron"
import { getDisplayName, getInitials } from "@/lib/profile"
import { supabase } from "@/lib/supabase"

const menuItems = [
  { label: "Settings", to: "/app/settings", icon: settings },
  { label: "Appearance", to: "/app/settings/appearance", icon: desktop },
  { label: "Billing", to: "/app/settings/billing", icon: file },
]

export function NavUser() {
  const { session } = useAuth()
  const { state } = useSidebar()
  const navigate = useNavigate()

  const email = session?.user.email ?? ""
  const initials = session ? getInitials(session.user) : "??"
  const name = (session && getDisplayName(session.user)) || "Account"

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate("/login", { replace: true })
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="cursor-pointer h-[52px] pr-3 pl-2.5 group-data-[collapsible=icon]:size-[52px]! group-data-[collapsible=icon]:px-2.5!"
            >
              <Avatar className="size-8 shrink-0 rounded-lg">
                <AvatarFallback className="rounded-lg text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-[14.5px] leading-tight">
                <span className="truncate font-medium">{name}</span>
                <span className="text-muted-foreground truncate text-[12.5px]">
                  {email}
                </span>
              </div>
              <MenuChevron className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side="top"
            align={state === "collapsed" ? "start" : "end"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8 rounded-lg">
                  <AvatarFallback className="rounded-lg text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {menuItems.map((item) => (
                <DropdownMenuItem
                  key={item.label}
                  onClick={() => navigate(item.to)}
                >
                  <Icon src={item.icon} />
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/app/support")}>
              <Icon src={lifeBuoy} />
              Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
              <Icon src={logout} />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
