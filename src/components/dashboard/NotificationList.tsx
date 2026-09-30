import { Loader2 } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { Button } from "@/components/ui/button"
import { useNotificationList } from "@/hooks/use-notification-list"
import { NotificationRow } from "./NotificationRow"
import { NotificationSkeletonRow } from "./NotificationSkeletonRow"

type Props = {
  pageSize: number
  // Shown when there is nothing to list.
  empty: React.ReactNode
  className?: string
}

// The list itself, shared by the bell panel and the Notifications tab. Mount
// it only while it is on screen: mounting is what counts as looking.
export function NotificationList({ pageSize, empty, className }: Props) {
  const { items, hasMore, loadingMore, error, loadMore, dismiss, isNew } =
    useNotificationList(pageSize)

  if (error && !items) return <FormAlert tone="error">{error}</FormAlert>

  if (!items) {
    return (
      <ul className="divide-y" aria-busy="true">
        {Array.from({ length: Math.min(pageSize, 4) }, (_, i) => (
          <NotificationSkeletonRow key={i} />
        ))}
      </ul>
    )
  }

  if (items.length === 0) return <>{empty}</>

  return (
    <div className={className}>
      <ul className="divide-y">
        {items.map((notification) => (
          <NotificationRow
            key={notification.id}
            notification={notification}
            isNew={isNew(notification)}
            onDismiss={dismiss}
          />
        ))}
      </ul>
      {error && (
        <div className="px-4 py-3">
          <FormAlert tone="error">{error}</FormAlert>
        </div>
      )}
      {hasMore && (
        <div className="border-t p-2">
          <Button
            variant="ghost"
            className="w-full"
            disabled={loadingMore}
            onClick={loadMore}
          >
            {loadingMore && <Loader2 className="size-4 animate-spin" />}
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}
