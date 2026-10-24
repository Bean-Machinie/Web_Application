import { useEffect, useRef, useState } from "react"
import { useNotificationsPanel } from "@/hooks/use-notifications-panel"
import bell from "@/assets/icons/bell.svg"
import type { IconHandle } from "@/components/AnimatedIcon"
import { BellIcon } from "@/components/BellIcon"
import { Icon } from "@/components/Icon"
import { HoverIcon } from "@/components/icons/HoverIcon"
import { SettingsIcon } from "@/components/icons/SettingsIcon"
import { IconButton } from "@/components/IconButton"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSettingsWindow } from "@/hooks/use-settings-window"
import { BELL_PAGE_SIZE } from "@/lib/notifications"
import { NotificationBadge } from "./NotificationBadge"
import { NotificationList } from "./NotificationList"
import { useCampaign } from "./useCampaign"

function CaughtUp() {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
      <div className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-full">
        <Icon src={bell} className="size-5" />
      </div>
      <p className="text-sm font-medium">You&apos;re all caught up</p>
      <p className="text-muted-foreground text-xs">
        Invitations and campaign updates will show up here.
      </p>
    </div>
  )
}

export function NotificationBell() {
  const panel = useNotificationsPanel()
  const settingsWindow = useSettingsWindow()
  const { unreadCount } = useCampaign()
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const content = useRef<HTMLDivElement>(null)
  // The popover closes on a press outside it, but the graph's canvas swallows presses
  // before they reach the page, so while it is open they are watched on the way down.
  useEffect(() => {
    if (!open) return
    const onPress = (event: PointerEvent) => {
      const target = event.target as Node
      if (content.current?.contains(target) || trigger.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener("pointerdown", onPress, true)
    return () => document.removeEventListener("pointerdown", onPress, true)
  }, [open])
  // The bell swings on a click, and only then.
  const bell = useRef<IconHandle>(null)

  function viewAll() {
    setOpen(false)
    panel.open()
  }

  function openPreferences() {
    setOpen(false)
    settingsWindow.open("notifications")
  }

  return (
    // Not modal: a modal one locks the page scroll, which makes the page and the button jump
    // as the scrollbar goes and comes back.
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <IconButton
          ref={trigger}
          icon={BellIcon}
          animateRef={bell}
          label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
          onClick={() => bell.current?.startAnimation()}
        >
          {unreadCount > 0 && <NotificationBadge count={unreadCount} />}
        </IconButton>
      </PopoverTrigger>
      <PopoverContent
        ref={content}
        align="end"
        sideOffset={8}
        className="w-[min(26rem,calc(100vw-2rem))] gap-0 overflow-hidden rounded-xl p-0"
      >
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
              {unreadCount} new
            </span>
          )}
        </div>

        <ScrollArea type="scroll" className="*:data-[slot=scroll-area-viewport]:max-h-[26rem]">
          <NotificationList pageSize={BELL_PAGE_SIZE} empty={<CaughtUp />} />
        </ScrollArea>

        <div className="flex items-center gap-1 border-t p-2">
          <Button variant="ghost" className="flex-1" onClick={viewAll}>
            View all notifications
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            aria-label="Notification settings"
            onClick={openPreferences}
          >
            <HoverIcon icon={SettingsIcon} size={16} />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
