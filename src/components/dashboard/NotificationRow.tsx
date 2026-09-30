import { useState } from "react"
import cross from "@/assets/icons/cross.svg"
import { FormAlert } from "@/components/auth/FormAlert"
import { Icon } from "@/components/Icon"
import { Button } from "@/components/ui/button"
import { errorMessage } from "@/lib/campaigns"
import type { AppNotification } from "@/lib/notifications"
import { timeAgo } from "@/lib/time"
import { cn } from "@/lib/utils"
import { CampaignAvatar } from "./CampaignAvatar"
import { InvitationActions } from "./InvitationActions"
import { NotificationMessage } from "./NotificationMessage"

type Props = {
  notification: AppNotification
  isNew: boolean
  onDismiss: (id: string) => Promise<void>
}

// Height is shared with NotificationSkeletonRow. A small dot and a faint tint
// mark what is new; an unanswered invitation keeps its buttons.
export function NotificationRow({ notification, isNew, onDismiss }: Props) {
  const [error, setError] = useState<string | null>(null)
  const pending =
    notification.type === "campaign_invitation" &&
    notification.invitationStatus === "pending"

  async function dismiss() {
    setError(null)
    try {
      await onDismiss(notification.id)
    } catch (failure) {
      setError(errorMessage(failure))
    }
  }

  return (
    <li className={cn("relative py-4 pr-4 pl-6", isNew && "bg-primary/5")}>
      {isNew && (
        <span
          aria-label="Unread"
          className="bg-primary absolute top-9 left-2.5 size-2 -translate-y-1/2 rounded-full"
        />
      )}
      <div className="flex items-start gap-3">
        <CampaignAvatar
          name={notification.campaignName}
          imageUrl={notification.campaignImageUrl}
          className="size-10 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm">
            <NotificationMessage notification={notification} />
          </p>
          <p className="text-muted-foreground text-xs">
            {timeAgo(notification.createdAt)}
          </p>
          {pending && notification.invitationId && (
            <div className="mt-3">
              <InvitationActions invitationId={notification.invitationId} />
            </div>
          )}
        </div>
        {!pending && (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground -mt-1 -mr-2 size-8 shrink-0"
            aria-label="Dismiss"
            onClick={dismiss}
          >
            <Icon src={cross} className="size-4" />
          </Button>
        )}
      </div>
      {error && (
        <div className="mt-2">
          <FormAlert tone="error">{error}</FormAlert>
        </div>
      )}
    </li>
  )
}
