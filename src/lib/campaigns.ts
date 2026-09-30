import { deleteImage } from "@/lib/avatar"
import { supabase } from "@/lib/supabase"
import type { CampaignRole } from "./campaign-permissions"

export type Campaign = {
  id: string
  name: string
  role: CampaignRole
  // Who created it. That person alone can delete it, and cannot leave it.
  createdBy: string
  imageUrl: string | null
  imagePath: string | null
}

// Supabase errors are not always Error instances, so read the message directly.
export function errorMessage(error: unknown) {
  return (error as { message?: string })?.message ?? "Something went wrong."
}

export async function fetchCampaigns(userId: string): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from("campaign_members")
    .select(
      "role, campaign:campaigns(id, name, created_by, image_url, image_path)"
    )
    .eq("user_id", userId)
    .order("joined_at")
  if (error) throw error

  // Without generated types, supabase-js infers the embed as an array, but
  // campaign_id is a to-one relation, so it is a single object at runtime.
  const rows = data as unknown as {
    role: CampaignRole
    campaign: {
      id: string
      name: string
      created_by: string
      image_url: string | null
      image_path: string | null
    }
  }[]

  return rows.map((row) => ({
    id: row.campaign.id,
    name: row.campaign.name,
    role: row.role,
    createdBy: row.campaign.created_by,
    imageUrl: row.campaign.image_url,
    imagePath: row.campaign.image_path,
  }))
}

export async function createCampaign(name: string): Promise<Campaign> {
  const { data, error } = await supabase.rpc("create_campaign", {
    campaign_name: name,
  })
  if (error) throw error

  return {
    id: data.id,
    name: data.name,
    role: "gm",
    createdBy: data.created_by,
    imageUrl: null,
    imagePath: null,
  }
}

export async function joinCampaign(code: string): Promise<string> {
  const { data, error } = await supabase.rpc("join_campaign", {
    invite_code: code,
  })
  if (error) throw error

  return data
}

// The image goes first: once the campaign is deleted nobody has the
// permission to remove it any more. The name is checked again by the
// database, so the confirmation cannot be skipped.
export async function deleteCampaign(campaign: Campaign, confirmName: string) {
  await deleteImage("campaign-images", campaign.imagePath)

  const { error } = await supabase.rpc("delete_campaign", {
    target_campaign: campaign.id,
    confirm_name: confirmName,
  })
  if (error) throw error
}

export async function leaveCampaign(campaignId: string) {
  const { error } = await supabase.rpc("leave_campaign", {
    target_campaign: campaignId,
  })
  if (error) throw error
}

export async function fetchInviteCode(campaignId: string): Promise<string> {
  const { data, error } = await supabase
    .from("campaign_invites")
    .select("code")
    .eq("campaign_id", campaignId)
    .single()
  if (error) throw error

  return data.code
}

export async function resetInviteCode(campaignId: string): Promise<string> {
  const { data, error } = await supabase.rpc("reset_campaign_invite", {
    target_campaign: campaignId,
  })
  if (error) throw error

  return data
}

// The public page people land on when they open an invite link.
export function inviteUrl(code: string) {
  return `${window.location.origin}/invite?code=${code}`
}

// Accepts a full invite link or just the code.
export function parseInviteCode(input: string) {
  const text = input.trim()
  try {
    return new URL(text).searchParams.get("code") ?? text
  } catch {
    return text
  }
}
