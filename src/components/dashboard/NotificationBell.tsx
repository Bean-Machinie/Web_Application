import { useState } from "react"
import { useNotificationsPanel } from "@/hooks/use-notifications-panel"
import bell from "@/assets/icons/bell.svg"
import { Icon } from "@/components/Icon"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSettingsWindow } from "@/hooks/use-settings-window"
import { BELL_PAGE_SIZE } from "@/lib/notifications"
import settings from "@/assets/icons/settings.svg"
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
  // Counts up to swing the bell again: on a click, and when something new arrives.
  const [rings, setRings] = useState(0)
  const [seen, setSeen] = useState(unreadCount)
  if (seen !== unreadCount) {
    setSeen(unreadCount)
    if (unreadCount > seen) setRings((n) => n + 1)
  }

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
        <Button
          variant="ghost"
          size="icon"
          className="data-[state=open]:bg-accent relative size-11"
          onClick={() => setRings((n) => n + 1)}
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
        >
          <span
            key={rings}
            className={rings > 0 ? "inline-flex origin-top motion-safe:animate-[bell-ring_700ms_ease-in-out]" : "inline-flex"}
          >
            <Icon src={bell} className="size-6" />
          </span>
          {unreadCount > 0 && <NotificationBadge count={unreadCount} />}
        </Button>
      </PopoverTrigger>
      <PopoverContent
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
            <Icon src={settings} />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
