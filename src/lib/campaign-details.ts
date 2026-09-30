import { supabase } from "@/lib/supabase"
import type { CampaignStatus } from "./campaigns"

export async function saveCampaignDetails(
  campaignId: string,
  name: string,
  description: string
) {
  const { error } = await supabase.rpc("update_campaign_details", {
    target_campaign: campaignId,
    new_name: name,
    new_description: description,
  })
  if (error) throw error
}

export async function saveCampaignStatus(
  campaignId: string,
  status: CampaignStatus
) {
  const { error } = await supabase.rpc("set_campaign_status", {
    target_campaign: campaignId,
    new_status: status,
  })
  if (error) throw error
}
