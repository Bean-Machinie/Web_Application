import type { TemplateEntry } from "./campaign-template-types"
import { deleteImage } from "@/lib/avatar"
import { supabase } from "@/lib/supabase"
import type { CampaignRole } from "./campaign-permissions"

export type CampaignStatus = "active" | "paused" | "finished"

export const STATUS_LABELS: Record<CampaignStatus, string> = {
  active: "Active",
  paused: "Paused",
  finished: "Finished",
}

export type Campaign = {
  id: string
  name: string
  description: string
  status: CampaignStatus
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

const STATUS_ORDER: Record<CampaignStatus, number> = {
  active: 0,
  paused: 1,
  finished: 2,
}

export async function fetchCampaigns(userId: string): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from("campaign_members")
    .select(
      "role, campaign:campaigns(id, name, description, status, created_by, image_url, image_path)"
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
      description: string
      status: CampaignStatus
      created_by: string
      image_url: string | null
      image_path: string | null
    }
  }[]

  const campaigns = rows.map((row) => ({
    id: row.campaign.id,
    name: row.campaign.name,
    description: row.campaign.description,
    status: row.campaign.status,
    role: row.role,
    createdBy: row.campaign.created_by,
    imageUrl: row.campaign.image_url,
    imagePath: row.campaign.image_path,
  }))

  // Paused and finished campaigns drop to the bottom. The sort is stable, so
  // each group keeps the order people joined in.
  return campaigns.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status])
}

// Starter entries are created with the campaign, in the same transaction.
export async function createCampaign(
  name: string,
  starterEntries: TemplateEntry[] = []
): Promise<Campaign> {
  const { data, error } = await supabase.rpc("create_campaign", {
    campaign_name: name,
    starter_entries: starterEntries,
  })
  if (error) throw error

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    status: data.status,
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
