import { InvitationItem } from "./InvitationItem"
import { NoticeItem } from "./NoticeItem"
import type { FeedEntry } from "./useNotificationFeed"

export function FeedItem({
  entry,
  compact,
}: {
  entry: FeedEntry
  compact?: boolean
}) {
  return entry.kind === "invitation" ? (
    <InvitationItem invitation={entry.invitation} compact={compact} />
  ) : (
    <NoticeItem notification={entry.notification} />
  )
}
