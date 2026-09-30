import { supabase } from "@/lib/supabase"

// An invitation sent to me, shown in Notifications.
export type Invitation = {
  id: string
  campaignId: string
  campaignName: string
  campaignImageUrl: string | null
  invitedByName: string
  createdAt: string
}

export type Invitee = {
  id: string
  displayName: string | null
  username: string | null
  avatarUrl: string | null
  isMember: boolean
  hasPending: boolean
}

// An invitation the GM has sent that has not been answered yet.
export type SentInvitation = {
  id: string
  inviteeName: string | null
  inviteeUsername: string | null
  createdAt: string
}

export async function fetchMyInvitations(): Promise<Invitation[]> {
  const { data, error } = await supabase.rpc("my_pending_invitations")
  if (error) throw error

  return (data as Record<string, string | null>[]).map((row) => ({
    id: row.id!,
    campaignId: row.campaign_id!,
    campaignName: row.campaign_name!,
    campaignImageUrl: row.campaign_image_url,
    invitedByName: row.invited_by_name ?? "Someone",
    createdAt: row.created_at!,
  }))
}

// Returns the campaign id, which matters when accepting.
export async function respondToInvitation(id: string, accept: boolean) {
  const { data, error } = await supabase.rpc("respond_to_invitation", {
    invitation: id,
    accept,
  })
  if (error) throw error

  return data as string
}

export async function findInvitee(campaignId: string, search: string) {
  const { data, error } = await supabase.rpc("find_invitee", {
    target_campaign: campaignId,
    search,
  })
  if (error) throw error

  return (data as Record<string, unknown>[]).map(
    (row): Invitee => ({
      id: row.id as string,
      displayName: row.display_name as string | null,
      username: row.username as string | null,
      avatarUrl: row.avatar_url as string | null,
      isMember: row.is_member as boolean,
      hasPending: row.has_pending as boolean,
    })
  )
}

export async function inviteUser(campaignId: string, inviteeId: string) {
  const { error } = await supabase.rpc("invite_user", {
    target_campaign: campaignId,
    invitee: inviteeId,
  })
  if (error) throw error
}

export async function fetchSentInvitations(campaignId: string) {
  const { data, error } = await supabase.rpc("campaign_pending_invitations", {
    target_campaign: campaignId,
  })
  if (error) throw error

  return (data as Record<string, string | null>[]).map(
    (row): SentInvitation => ({
      id: row.id!,
      inviteeName: row.invitee_name,
      inviteeUsername: row.invitee_username,
      createdAt: row.created_at!,
    })
  )
}

export async function cancelInvitation(id: string) {
  const { error } = await supabase.rpc("cancel_invitation", { invitation: id })
  if (error) throw error
}

// Works without being signed in. Null means the link is not valid.
export async function fetchInvitePreview(code: string) {
  const { data, error } = await supabase.rpc("get_invite_preview", {
    invite_code: code,
  })
  if (error) throw error

  const row = (data as Record<string, string | null>[])[0]
  return row ? { name: row.campaign_name!, imageUrl: row.campaign_image_url } : null
}
