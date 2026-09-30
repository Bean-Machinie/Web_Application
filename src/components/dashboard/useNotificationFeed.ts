import type { Invitation } from "@/lib/invitations"
import type { AppNotification } from "@/lib/notifications"
import { useCampaign } from "./useCampaign"

export type FeedEntry =
  | { kind: "invitation"; at: string; id: string; invitation: Invitation }
  | { kind: "notice"; at: string; id: string; notification: AppNotification }

// Invitations and notices together, newest first. The bell and the
// Notifications tab both show this, so they always agree.
export function useNotificationFeed(): FeedEntry[] {
  const { invitations, notifications } = useCampaign()

  const entries: FeedEntry[] = [
    ...invitations.map(
      (invitation): FeedEntry => ({
        kind: "invitation",
        at: invitation.createdAt,
        id: invitation.id,
        invitation,
      })
    ),
    ...notifications.map(
      (notification): FeedEntry => ({
        kind: "notice",
        at: notification.createdAt,
        id: notification.id,
        notification,
      })
    ),
  ]

  return entries.sort((a, b) => b.at.localeCompare(a.at))
}
