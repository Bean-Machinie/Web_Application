import { NotificationList } from "@/components/dashboard/NotificationList"
import { TAB_PAGE_SIZE } from "@/lib/notifications"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"

export function SettingsNotifications() {
  return (
    <div className="pt-6">
      <NotificationList
        pageSize={TAB_PAGE_SIZE}
        className="overflow-hidden rounded-lg border"
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
    </div>
  )
}
