import { Link } from "react-router-dom"
import { ArrowRight, BookOpen, FileText, ScrollText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useAccount } from "@/hooks/use-account"
import { useCampaignMembers } from "@/hooks/use-campaign-members"
import { useLastPage } from "@/hooks/use-last-page"
import { FALLBACK_COVER_IMAGE } from "@/lib/campaign-covers"
import { campaignPath } from "@/lib/campaign-paths"
import type { Campaign } from "@/lib/campaigns"
import { CampaignMemberStack } from "./CampaignMemberStack"
import { D20Button } from "./D20Button"

// For someone with a campaign to go back to: its square cover edge to edge on the left, which
// zooms slowly while the card is hovered with a faint warm glow behind it, and where you left off.
export function HomeHeroReturning({ campaign }: { campaign: Campaign }) {
  const { name } = useAccount()
  const page = useLastPage(campaign.id)
  const members = useCampaignMembers([campaign])[campaign.id]

  const icons = [
    { label: "Journal", to: campaignPath(campaign.id, "journal"), icon: BookOpen },
    { label: "World", to: campaignPath(campaign.id, "world"), icon: ScrollText },
  ]

  return (
    <div className="group relative isolate">
      <div aria-hidden className="absolute -inset-3 -z-10 rounded-3xl bg-orange-400/20 opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100 motion-reduce:transition-none" />
      <section className="bg-card relative flex h-40 overflow-hidden rounded-xl border">
        <div className="size-40 shrink-0 overflow-hidden">
          <img
            src={campaign.imageUrl ?? FALLBACK_COVER_IMAGE}
            alt=""
            className="size-full object-cover transition-transform duration-[6000ms] ease-out group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 p-3">
          <span className="text-muted-foreground text-xs">Welcome back, {name}</span>
          <h2 className="truncate text-2xl font-semibold tracking-tight">Last time in {campaign.name}</h2>
          {page && (
            <p className="text-muted-foreground flex min-w-0 items-center gap-1.5 text-sm">
              <FileText className="size-3.5 shrink-0" />
              <span className="truncate">You left off at {page.title}</span>
            </p>
          )}
          <CampaignMemberStack members={members} />
          <div className="mt-auto flex items-center gap-1">
            <div className="mr-1">
              <D20Button to={campaignPath(campaign.id, page ? `journal/${page.id}` : "")}>Continue</D20Button>
            </div>
            {icons.map(({ label, to, icon: Icon }) => (
              <Tooltip key={label}>
                <TooltipTrigger asChild>
                  <Button asChild variant="ghost" size="icon-sm">
                    <Link to={to} aria-label={label}>
                      <Icon />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
              </Tooltip>
            ))}
            <Link to="/app/campaigns" className="text-muted-foreground hover:text-foreground ml-auto flex items-center gap-1 text-sm transition-colors">
              All campaigns
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
