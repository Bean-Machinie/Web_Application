import { supabase } from "@/lib/supabase"

export type NotificationType = "campaign_deleted" | "member_left"

// Something that happened that needs no answer, only reading and dismissing.
// Invitations are separate, because they do need an answer.
export type AppNotification = {
  id: string
  type: NotificationType
  campaignName: string
  actorName: string
  createdAt: string
}

export async function fetchNotifications(): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, campaign_name, actor_name, created_at")
    .order("created_at", { ascending: false })
  if (error) throw error

  return (data as Record<string, string>[]).map((row) => ({
    id: row.id,
    type: row.type as NotificationType,
    campaignName: row.campaign_name,
    actorName: row.actor_name,
    createdAt: row.created_at,
  }))
}

export async function dismissNotification(id: string) {
  const { error } = await supabase.from("notifications").delete().eq("id", id)
  if (error) throw error
}
