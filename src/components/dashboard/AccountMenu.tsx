import type { ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import desktop from "@/assets/icons/desktop.svg"
import file from "@/assets/icons/file.svg"
import lifeBuoy from "@/assets/icons/life-buoy.svg"
import logout from "@/assets/icons/menu-logout.svg"
import settings from "@/assets/icons/settings.svg"
import { Icon } from "@/components/Icon"
import { useSettingsWindow } from "@/hooks/use-settings-window"
import { supabase } from "@/lib/supabase"
import { AccountIdentity } from "./AccountIdentity"
import type { SettingsTab } from "./settings-tabs"

const menuItems: { label: string; tab: SettingsTab; icon: string }[] = [
  { label: "Settings", tab: "profile", icon: settings },
  { label: "Appearance", tab: "appearance", icon: desktop },
  { label: "Billing", tab: "billing", icon: file },
]

type Props = {
  // The button that opens the menu.
  children: ReactNode
  side: "top" | "right"
  align: "start" | "end"
  // Called when something is chosen, before it is done, such as to close a drawer.
  onChoose?: () => void
  // Asked before leaving the page; false if it is not to be left yet.
  beforeLeave?: () => Promise<boolean>
}

// The account menu, as it is in the dashboard's sidebar and in the map builder: the settings
// open as a window over the page, and the rest go to their page.
export function AccountMenu({ children, side, align, onChoose, beforeLeave }: Props) {
  const navigate = useNavigate()
  const settingsWindow = useSettingsWindow()

  const choose = (action: () => void | Promise<void>) => async () => {
    onChoose?.()
    await action()
  }
  const leaveTo = (go: () => void | Promise<void>) =>
    choose(async () => {
      if (beforeLeave && !(await beforeLeave())) return
      await go()
    })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        side={side}
        align={align}
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5">
            <AccountIdentity />
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {menuItems.map((item) => (
            <DropdownMenuItem key={item.label} onClick={choose(() => settingsWindow.open(item.tab))}>
              <Icon src={item.icon} />
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={leaveTo(() => navigate("/app/support"))}>
          <Icon src={lifeBuoy} />
          Support
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={leaveTo(async () => {
            await supabase.auth.signOut()
            navigate("/login", { replace: true })
          })}
        >
          <Icon src={logout} />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
