export type CampaignRole = "gm" | "player"
export type CampaignPermission = "invite"

// The one place the UI asks "may this role do that?". It mirrors the
// campaign_role_permissions table in supabase/migrations, which is what the
// database actually enforces, so change both together. To give a new role
// (say a co-GM) invite rights, add it here and add its row in the table.
const grants: Record<CampaignRole, CampaignPermission[]> = {
  gm: ["invite"],
  player: [],
}

export function can(role: CampaignRole, permission: CampaignPermission) {
  return grants[role].includes(permission)
}
