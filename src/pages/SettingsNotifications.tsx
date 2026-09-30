import { FeedItem } from "@/components/dashboard/FeedItem"
import { useNotificationFeed } from "@/components/dashboard/useNotificationFeed"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"

export function SettingsNotifications() {
  const feed = useNotificationFeed()

  return (
    <div className="pt-6">
      {feed.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyTitle>No notifications</EmptyTitle>
            <EmptyDescription>
              Invitations and campaign updates will show up here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="divide-y rounded-lg border">
          {feed.map((entry) => (
            <FeedItem key={entry.id} entry={entry} />
          ))}
        </ul>
      )}
    </div>
  )
}
