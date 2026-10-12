import { Bell } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useNotificationsPanel } from "@/hooks/use-notifications-panel"
import { TAB_PAGE_SIZE } from "@/lib/notifications"
import { NotificationList } from "./NotificationList"

function NothingYet() {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
      <div className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-full">
        <Bell className="size-5" />
      </div>
      <p className="text-sm font-medium">You&apos;re all caught up</p>
      <p className="text-muted-foreground text-xs">Invitations and campaign updates will show up here.</p>
    </div>
  )
}

// Every notification, sliding in from the right over whatever page is open. Mounted once with
// the settings window, so it is there on the map builder too.
export function NotificationsPanel() {
  const { isOpen, close } = useNotificationsPanel()

  return (
    <Sheet open={isOpen} onOpenChange={(next) => !next && close()}>
      <SheetContent className="gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b p-4 pr-12">
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>Invitations and campaign updates.</SheetDescription>
        </SheetHeader>
        <ScrollArea type="scroll" className="min-h-0 flex-1">
          <NotificationList pageSize={TAB_PAGE_SIZE} empty={<NothingYet />} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
