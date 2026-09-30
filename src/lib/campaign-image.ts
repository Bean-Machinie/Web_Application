import { deleteImage, uploadImage } from "@/lib/avatar"
import type { AvatarChange } from "@/lib/avatar"
import { supabase } from "@/lib/supabase"
import type { Campaign } from "./campaigns"

const BUCKET = "campaign-images"

// Applies a picked (or removed) image to a campaign. The old file is deleted
// only once the campaign points at the new one.
export async function saveCampaignImage(campaign: Campaign, change: AvatarChange) {
  const uploaded = change.file
    ? await uploadImage(BUCKET, campaign.id, change.file)
    : null

  const { error } = await supabase.rpc("set_campaign_image", {
    target_campaign: campaign.id,
    new_url: uploaded?.url ?? null,
    new_path: uploaded?.path ?? null,
  })
  if (error) throw error

  await deleteImage(BUCKET, campaign.imagePath)
}
