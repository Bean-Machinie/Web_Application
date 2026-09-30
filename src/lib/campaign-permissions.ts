import type { Campaign } from "./campaigns"

export type CampaignRole = "gm" | "player"
// invite: invite people. manage: change the campaign itself, such as its image.
// remove_members: take people out of the campaign.
export type CampaignPermission = "invite" | "manage" | "remove_members"

// The one place the UI asks "may this role do that?". It mirrors the
// campaign_role_permissions table in supabase/migrations, which is what the
// database actually enforces, so change both together. To give a new role
// (say a co-GM) invite rights, add it here and add its row in the table.
const grants: Record<CampaignRole, CampaignPermission[]> = {
  gm: ["invite", "manage", "remove_members"],
  player: [],
}

export function can(role: CampaignRole, permission: CampaignPermission) {
  return grants[role].includes(permission)
}

// Deleting, transferring and leaving depend on who created the campaign, not on a role, so
// they are not in the table above. The database enforces both as well.
export const canDeleteCampaign = (campaign: Campaign, userId: string) =>
  campaign.createdBy === userId

export const canTransferCampaign = canDeleteCampaign

export const canLeaveCampaign = (campaign: Campaign, userId: string) =>
  campaign.createdBy !== userId
