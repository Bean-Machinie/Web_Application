import { supabase } from "@/lib/supabase"

export type NotificationType =
  | "campaign_invitation"
  | "campaign_deleted"
  | "member_left"
  | "removed_from_campaign"
  | "ownership_received"
  | "ownership_given"

export type InvitationStatus = "pending" | "accepted" | "declined" | "cancelled"

// Everything that happens to a person shows up as one of these. Invitations
// are notifications that also carry the invitation's current status, which
// is what decides whether Accept and Decline are still shown.
export type AppNotification = {
  id: string
  type: NotificationType
  campaignId: string | null
  campaignName: string
  campaignImageUrl: string | null
  actorName: string
  invitationId: string | null
  invitationStatus: InvitationStatus | null
  readAt: string | null
  createdAt: string
}

export type NotificationCursor = { createdAt: string; id: string }

// Newest first. Pass the last notification of the previous page as the cursor
// to get the next one.
export async function fetchNotificationPage(
  limit: number,
  cursor?: NotificationCursor
): Promise<AppNotification[]> {
  const { data, error } = await supabase.rpc("my_notifications", {
    page_size: limit,
    before_created_at: cursor?.createdAt ?? null,
    before_id: cursor?.id ?? null,
  })
  if (error) throw error

  return (data as Record<string, string | null>[]).map((row) => ({
    id: row.id!,
    type: row.type as NotificationType,
    campaignId: row.campaign_id,
    campaignName: row.campaign_name!,
    campaignImageUrl: row.campaign_image_url,
    actorName: row.actor_name!,
    invitationId: row.invitation_id,
    invitationStatus: row.invitation_status as InvitationStatus | null,
    readAt: row.read_at,
    createdAt: row.created_at!,
  }))
}

export async function fetchUnreadCount(): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .is("read_at", null)
  if (error) throw error

  return count ?? 0
}

export async function markNotificationsRead(ids: string[]) {
  const { error } = await supabase.rpc("mark_notifications_read", { ids })
  if (error) throw error
}

export async function dismissNotification(id: string) {
  const { error } = await supabase.from("notifications").delete().eq("id", id)
  if (error) throw error
}
