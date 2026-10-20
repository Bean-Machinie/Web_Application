import { ExternalLink, LogOut, Settings } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/auth/useAuth"
import { campaignPath } from "@/lib/campaign-paths"
import { can, canLeaveCampaign } from "@/lib/campaign-permissions"
import type { Campaign } from "@/lib/campaigns"
import { MemberMenu } from "./MemberMenu"

type Props = { campaign: Campaign; onLeave: (campaign: Campaign) => void }

// The three-dot menu on a campaign. The owner cannot leave, so it is not
// offered to them.
export function CampaignMenu({ campaign, onLeave }: Props) {
  const userId = useAuth().session!.user.id
  const navigate = useNavigate()

  const actions = [
    { label: "Open", icon: ExternalLink, onSelect: () => navigate(campaignPath(campaign.id)) },
    ...(can(campaign.role, "manage")
      ? [
          {
            label: "Campaign settings",
            icon: Settings,
            onSelect: () => navigate(campaignPath(campaign.id, "campaign-settings")),
          },
        ]
      : []),
    ...(canLeaveCampaign(campaign, userId)
      ? [{ label: "Leave campaign", icon: LogOut, destructive: true, onSelect: () => onLeave(campaign) }]
      : []),
  ]

  return <MemberMenu name={campaign.name} actions={actions} />
}
