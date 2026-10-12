import { NotificationList } from "@/components/dashboard/NotificationList"
import { NotificationToggles } from "@/components/dashboard/NotificationToggles"
import { TAB_PAGE_SIZE } from "@/lib/notifications"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"

export function SettingsNotifications() {
  return (
    <div className="grid gap-10">
      <NotificationToggles />
      <section>
        <h4 className="text-muted-foreground mb-2 text-xs font-medium">Recent</h4>
        <NotificationList
          pageSize={TAB_PAGE_SIZE}
          className="overflow-hidden rounded-xl border"
          empty={
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyTitle>No notifications</EmptyTitle>
                <EmptyDescription>
                  Invitations and campaign updates will show up here.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          }
        />
      </section>
    </div>
  )
}
