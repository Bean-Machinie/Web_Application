import { useState } from "react"
import cross from "@/assets/icons/cross.svg"
import { FormAlert } from "@/components/auth/FormAlert"
import { Icon } from "@/components/Icon"
import { Button } from "@/components/ui/button"
import { errorMessage } from "@/lib/campaigns"
import type { AppNotification } from "@/lib/notifications"
import { timeAgo } from "@/lib/time"
import { CampaignAvatar } from "./CampaignAvatar"
import { useCampaign } from "./useCampaign"

function Message({ notification }: { notification: AppNotification }) {
  const actor = <span className="font-medium">{notification.actorName}</span>
  const campaign = <span className="font-medium">{notification.campaignName}</span>

  switch (notification.type) {
    case "campaign_deleted":
      return <>{actor} deleted the campaign {campaign}.</>
    case "removed_from_campaign":
      return <>{actor} removed you from {campaign}.</>
    case "ownership_received":
      return <>{actor} made you the owner of {campaign}.</>
    case "ownership_given":
      return <>You made {actor} the owner of {campaign}.</>
    default:
      return <>{actor} left {campaign}.</>
  }
}

// A notification that needs no answer, only reading and dismissing.
export function NoticeItem({ notification }: { notification: AppNotification }) {
  const { dismiss } = useCampaign()
  const [error, setError] = useState<string | null>(null)

  async function handleDismiss() {
    setError(null)
    try {
      await dismiss(notification.id)
    } catch (failure) {
      setError(errorMessage(failure))
    }
  }

  return (
    <li className="flex flex-col gap-3 px-4 py-4">
      <div className="flex items-start gap-3">
        <CampaignAvatar
          name={notification.campaignName}
          className="size-10 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm">
            <Message notification={notification} />
          </p>
          <p className="text-muted-foreground text-xs">
            {timeAgo(notification.createdAt)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground -mt-1 -mr-2 size-8 shrink-0"
          aria-label="Dismiss"
          onClick={handleDismiss}
        >
          <Icon src={cross} className="size-4" />
        </Button>
      </div>
      {error && <FormAlert tone="error">{error}</FormAlert>}
    </li>
  )
}
