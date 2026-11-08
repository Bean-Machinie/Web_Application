import { Link } from "react-router-dom"
import { BookOpen, FileText, ScrollText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useCampaignMembers } from "@/hooks/use-campaign-members"
import { useLastPage } from "@/hooks/use-last-page"
import { FALLBACK_COVER_IMAGE } from "@/lib/campaign-covers"
import { campaignPath } from "@/lib/campaign-paths"
import type { Campaign } from "@/lib/campaigns"
import { shortAgo } from "@/lib/time"
import { CampaignMemberStack } from "./CampaignMemberStack"
import { HeroButton } from "./HeroButton"

type Props = {
  campaign: Campaign
  // When it was last opened, in milliseconds; null when that was not remembered.
  openedAt: number | null
}

// The front card for someone with a campaign to go back to: its square cover edge to edge on the
// left, then its name, the page you were on and when, who is in it, and the way back in.
export function HomeHeroReturning({ campaign, openedAt }: Props) {
  const page = useLastPage(campaign.id)
  const members = useCampaignMembers([campaign])[campaign.id]
  const when = openedAt === null ? null : `opened ${shortAgo(new Date(openedAt).toISOString())}`
  const detail = [page?.title, when].filter(Boolean).join(" · ")

  const icons = [
    { label: "Journal", to: campaignPath(campaign.id, "journal"), icon: BookOpen },
    { label: "World", to: campaignPath(campaign.id, "world"), icon: ScrollText },
  ]

  return (
    <div className="flex h-full">
      <img src={campaign.imageUrl ?? FALLBACK_COVER_IMAGE} alt="" className="size-[238px] shrink-0 object-cover" />
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 p-6">
        <h2 className="truncate text-2xl font-semibold tracking-tight">{campaign.name}</h2>
        {detail && (
          <p className="text-muted-foreground flex min-w-0 items-center gap-1.5 text-sm">
            {page && <FileText className="size-3.5 shrink-0" />}
            <span className="truncate">{detail}</span>
          </p>
        )}
        <CampaignMemberStack members={members} />
        <div className="mt-2 flex items-center gap-3">
          <HeroButton to={campaignPath(campaign.id, page ? `journal/${page.id}` : "")}>Continue</HeroButton>
          <div className="flex gap-1">
            {icons.map(({ label, to, icon: Icon }) => (
              <Tooltip key={label}>
                <TooltipTrigger asChild>
                  <Button asChild variant="ghost" size="icon-lg">
                    <Link to={to} aria-label={label}>
                      <Icon />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
