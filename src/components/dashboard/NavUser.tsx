import { useNavigate } from "react-router-dom"
import { LogOut, Settings, User } from "lucide-react"
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
            <SidebarMenuButton size="lg" className="cursor-pointer pr-3 pl-1.5 group-data-[collapsible=icon]:h-12! group-data-[collapsible=icon]:pl-1.5!"
            >
              <Avatar className="size-5 shrink-0 rounded-md">
                <AvatarFallback className="rounded-md text-[9px]">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Account</span>
                <span className="text-muted-foreground truncate text-xs">
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
                <User />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/app/settings")}>
                <Settings />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
