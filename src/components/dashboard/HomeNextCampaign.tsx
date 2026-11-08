import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCampaignMembers } from "@/hooks/use-campaign-members"
import { roleLabel } from "@/lib/campaign-list"
import { campaignPath } from "@/lib/campaign-paths"
import type { Campaign } from "@/lib/campaigns"
import { HomeCardBody } from "./HomeCardBody"

// The second card for someone who has played: the campaign opened before the last, with who you are in
// it and how many people there are, and the way into it or to all of them.
export function HomeNextCampaign({ campaign }: { campaign: Campaign | undefined }) {
  const people = useCampaignMembers(campaign ? [campaign] : [])[campaign?.id ?? ""]
  const count = people ? `${people.length} ${people.length === 1 ? "member" : "members"}` : null

  return (
    <HomeCardBody
      title={campaign?.name ?? "Campaigns"}
      line={campaign ? [roleLabel(campaign.role), count].filter(Boolean).join(" · ") : "Everything you play in, in one place."}
      actions={
        <>
          {campaign && (
            <Button asChild size="lg">
              <Link to={campaignPath(campaign.id)}>Open</Link>
            </Button>
          )}
          <Link to="/app/campaigns" className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors">
            All campaigns
            <ArrowRight className="size-4" />
          </Link>
        </>
      }
    />
  )
}
