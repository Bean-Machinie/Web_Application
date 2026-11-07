import { Link } from "react-router-dom"
import { ArrowRight, BookOpen, FileText, ScrollText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useCampaignMembers } from "@/hooks/use-campaign-members"
import { useLastPage } from "@/hooks/use-last-page"
import { roleLabel } from "@/lib/campaign-list"
import { FALLBACK_COVER_IMAGE } from "@/lib/campaign-covers"
import { campaignPath } from "@/lib/campaign-paths"
import type { Campaign } from "@/lib/campaigns"

const members = (count: number) => `${count} ${count === 1 ? "member" : "members"}`

// The campaign opened last. Its square cover fills the left of the card edge to edge; Continue opens
// the page you were on, and the icons go to the journal and the world.
export function HomeContinue({ campaign }: { campaign: Campaign }) {
  const page = useLastPage(campaign.id)
  const people = useCampaignMembers([campaign])[campaign.id]

  const icons = [
    { label: "Journal", to: campaignPath(campaign.id, "journal"), icon: BookOpen },
    { label: "World", to: campaignPath(campaign.id, "world"), icon: ScrollText },
  ]

  return (
    <section className="bg-card flex h-[140px] overflow-hidden rounded-xl border">
      <img src={campaign.imageUrl ?? FALLBACK_COVER_IMAGE} alt="" className="size-[140px] shrink-0 object-cover" />
      <div className="flex min-w-0 flex-1 flex-col gap-1 p-3.5">
        <span className="text-muted-foreground text-xs">Continue where you left off</span>
        <h2 className="truncate text-xl font-semibold tracking-tight">{campaign.name}</h2>
        <p className="text-muted-foreground flex min-w-0 items-center gap-1.5 truncate text-sm">
          <span className="shrink-0">{roleLabel(campaign.role)}</span>
          {people && <span className="shrink-0">· {members(people.length)}</span>}
          {page && (
            <>
              <span>·</span>
              <FileText className="size-3.5 shrink-0" />
              <span className="truncate">Last opened: {page.title}</span>
            </>
          )}
        </p>
        <div className="mt-auto flex items-center gap-1">
          <Button asChild size="sm" className="mr-1">
            <Link to={campaignPath(campaign.id, page ? `journal/${page.id}` : "")}>Continue</Link>
          </Button>
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
            Browse all campaigns
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
