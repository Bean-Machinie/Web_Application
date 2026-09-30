import { useState } from "react"
import { useNavigate } from "react-router-dom"
import bell from "@/assets/icons/bell.svg"
import { Icon } from "@/components/Icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { FeedItem } from "./FeedItem"
import { useNotificationFeed } from "./useNotificationFeed"

// How many notifications the menu previews before "View all".
const PREVIEW_COUNT = 4

export function NotificationBell() {
  const navigate = useNavigate()
  const feed = useNotificationFeed()
  const [open, setOpen] = useState(false)
  const count = feed.length

  function viewAll() {
    setOpen(false)
    navigate("/app/settings/notifications")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-11"
          aria-label={
            count > 0 ? `Notifications, ${count} waiting` : "Notifications"
          }
        >
          <Icon src={bell} className="size-6" />
          {count > 0 && (
            <span className="bg-destructive ring-background absolute top-2.5 right-2.5 size-2.5 rounded-full ring-2" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(24rem,calc(100vw-2rem))] gap-0 p-0"
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {count > 0 && <Badge variant="secondary">{count} new</Badge>}
        </div>

        {count === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
            <div className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-full">
              <Icon src={bell} className="size-5" />
            </div>
            <p className="text-sm font-medium">You&apos;re all caught up</p>
            <p className="text-muted-foreground text-xs">
              Invitations and campaign updates will show up here.
            </p>
          </div>
        ) : (
          <ul className="max-h-[26rem] divide-y overflow-y-auto">
            {feed.slice(0, PREVIEW_COUNT).map((entry) => (
              <FeedItem key={entry.id} entry={entry} compact />
            ))}
          </ul>
        )}

        <div className="border-t p-2">
          <Button variant="ghost" className="w-full" onClick={viewAll}>
            {count > PREVIEW_COUNT
              ? `View all ${count} notifications`
              : "View all notifications"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
