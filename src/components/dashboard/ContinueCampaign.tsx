import { Link } from "react-router-dom"
import { BookOpen, ScrollText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useCampaignMembers } from "@/hooks/use-campaign-members"
import { useLastPage } from "@/hooks/use-last-page"
import { campaignPath } from "@/lib/campaign-paths"
import type { Campaign } from "@/lib/campaigns"
import { shortAgo } from "@/lib/time"
import { CampaignMemberStack } from "./CampaignMemberStack"
import { HomeCardBody } from "./HomeCardBody"

type Props = {
  campaign: Campaign
  // When it was last opened, in milliseconds; null when that was not remembered.
  openedAt: number | null
}

// The way back into the last campaign: its name, the page you were on and when, who is in it, and Continue.
export function ContinueCampaign({ campaign, openedAt }: Props) {
  const page = useLastPage(campaign.id)
  const members = useCampaignMembers([campaign])[campaign.id]
  const when = openedAt === null ? null : `opened ${shortAgo(new Date(openedAt).toISOString())}`
  const detail = [page?.title, when].filter(Boolean).join(" · ")

  const icons = [
    { label: "Journal", to: campaignPath(campaign.id, "journal"), icon: BookOpen },
    { label: "World", to: campaignPath(campaign.id, "world"), icon: ScrollText },
  ]

  return (
    <HomeCardBody
      title={campaign.name}
      line={detail || undefined}
      extra={<CampaignMemberStack members={members} />}
      actions={
        <>
          <Button asChild>
            <Link to={campaignPath(campaign.id, page ? `journal/${page.id}` : "")}>Continue</Link>
          </Button>
          <div className="flex gap-1">
            {icons.map(({ label, to, icon: Icon }) => (
              <Tooltip key={label}>
                <TooltipTrigger asChild>
                  <Button asChild variant="ghost" size="icon">
                    <Link to={to} aria-label={label}>
                      <Icon />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </>
      }
    />
  )
}
