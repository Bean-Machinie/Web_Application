import { supabase } from "@/lib/supabase"
import type { CampaignRole } from "./campaign-permissions"

export type Member = {
  userId: string
  username: string | null
  avatarUrl: string | null
  role: CampaignRole
  joinedAt: string
  isCreator: boolean
}

export async function fetchMembers(campaignId: string): Promise<Member[]> {
  const { data, error } = await supabase.rpc("campaign_members_list", {
    target_campaign: campaignId,
  })
  if (error) throw error

  return (data as Record<string, unknown>[]).map(
    (row): Member => ({
      userId: row.user_id as string,
      username: row.username as string | null,
      avatarUrl: row.avatar_url as string | null,
      role: row.role as CampaignRole,
      joinedAt: row.joined_at as string,
      isCreator: row.is_creator as boolean,
    })
  )
}

export async function removeMember(campaignId: string, userId: string) {
  const { error } = await supabase.rpc("remove_campaign_member", {
    target_campaign: campaignId,
    target_user: userId,
  })
  if (error) throw error
}

export async function transferOwnership(campaignId: string, userId: string) {
  const { error } = await supabase.rpc("transfer_campaign_ownership", {
    target_campaign: campaignId,
    new_owner: userId,
  })
  if (error) throw error
}
