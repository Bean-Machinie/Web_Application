import type { ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { AnimatedIconComponent } from "@/components/AnimatedIcon"
import { FileIcon } from "@/components/FileIcon"
import { LifeBuoyIcon } from "@/components/LifeBuoyIcon"
import { LogOutIcon } from "@/components/LogOutIcon"
import { MonitorIcon } from "@/components/MonitorIcon"
import { SettingsIcon } from "@/components/SettingsIcon"
import { useSettingsWindow } from "@/hooks/use-settings-window"
import { supabase } from "@/lib/supabase"
import { AccountIdentity } from "./AccountIdentity"
import { IconMenuItem } from "./IconMenuItem"
import type { SettingsTab } from "./settings-tabs"

const menuItems: { label: string; tab: SettingsTab; icon: AnimatedIconComponent }[] = [
  { label: "Settings", tab: "profile", icon: SettingsIcon },
  { label: "Appearance", tab: "appearance", icon: MonitorIcon },
  { label: "Billing", tab: "billing", icon: FileIcon },
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
            <IconMenuItem
              key={item.label}
              icon={item.icon}
              onClick={choose(() => settingsWindow.open(item.tab))}
            >
              {item.label}
            </IconMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <IconMenuItem icon={LifeBuoyIcon} onClick={leaveTo(() => navigate("/app/support"))}>
          Support
        </IconMenuItem>
        <DropdownMenuSeparator />
        <IconMenuItem
          icon={LogOutIcon}
          variant="destructive"
          onClick={leaveTo(async () => {
            await supabase.auth.signOut()
            navigate("/login", { replace: true })
          })}
        >
          Log out
        </IconMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
