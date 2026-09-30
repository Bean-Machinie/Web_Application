import type { AppNotification } from "@/lib/notifications"

// The one place that turns a notification into a sentence. A new type is one
// more case here; read state, paging and the badge need nothing.
export function NotificationMessage({ notification }: { notification: AppNotification }) {
  const actor = <span className="font-medium">{notification.actorName}</span>
  const campaign = <span className="font-medium">{notification.campaignName}</span>

  switch (notification.type) {
    case "campaign_invitation":
      if (notification.invitationStatus === "accepted") {
        return <>You joined {campaign}.</>
      }
      if (notification.invitationStatus === "declined") {
        return <>You declined the invitation to {campaign}.</>
      }
      return <>{actor} invited you to join {campaign}.</>
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
