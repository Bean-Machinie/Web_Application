import { supabase } from "@/lib/supabase"
import type { CampaignRole } from "./campaign-permissions"

export type Campaign = { id: string; name: string; role: CampaignRole }

// Supabase errors are not always Error instances, so read the message directly.
export function errorMessage(error: unknown) {
  return (error as { message?: string })?.message ?? "Something went wrong."
}

export async function fetchCampaigns(userId: string): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from("campaign_members")
    .select("role, campaign:campaigns(id, name)")
    .eq("user_id", userId)
    .order("joined_at")
  if (error) throw error

  // Without generated types, supabase-js infers the embed as an array, but
  // campaign_id is a to-one relation, so it is a single object at runtime.
  const rows = data as unknown as {
    role: CampaignRole
    campaign: { id: string; name: string }
  }[]

  return rows.map((row) => ({
    id: row.campaign.id,
    name: row.campaign.name,
    role: row.role,
  }))
}

export async function createCampaign(name: string): Promise<Campaign> {
  const { data, error } = await supabase.rpc("create_campaign", {
    campaign_name: name,
  })
  if (error) throw error

  return { id: data.id, name: data.name, role: "gm" }
}

export async function joinCampaign(code: string): Promise<string> {
  const { data, error } = await supabase.rpc("join_campaign", {
    invite_code: code,
  })
  if (error) throw error

  return data
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

export function inviteUrl(code: string) {
  return `${window.location.origin}/campaigns/join?code=${code}`
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
