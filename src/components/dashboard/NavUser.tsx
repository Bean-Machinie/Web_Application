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
import profile from "@/assets/icons/menu-profile.svg"
import settings from "@/assets/icons/settings.svg"
import { Icon } from "@/components/Icon"
import { MenuChevron } from "./MenuChevron"
import { supabase } from "@/lib/supabase"

export function NavUser() {
  const { session } = useAuth()
  const { state } = useSidebar()
  const navigate = useNavigate()

  const email = session?.user.email ?? ""
  const initials = email.slice(0, 2).toUpperCase() || "??"

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
                <span className="truncate font-medium">Account</span>
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
                  <span className="truncate font-medium">Account</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate("/app/settings")}>
                <Icon src={profile} />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/app/settings")}>
                <Icon src={settings} />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
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
