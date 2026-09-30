import { Link, useNavigate } from "react-router-dom"
import arrow from "@/assets/icons/arrow.svg"
import { FormAlert } from "@/components/auth/FormAlert"
import { CampaignAvatar } from "@/components/dashboard/CampaignAvatar"
import { useCampaign } from "@/components/dashboard/useCampaign"
import { FullScreenLayout } from "@/components/FullScreenLayout"
import { FullScreenSpinner } from "@/components/FullScreenSpinner"
import { Icon } from "@/components/Icon"
import { LogoMark } from "@/components/LogoMark"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

// The hub: where people with no campaign start, and where anyone can come
// back to switch campaign or add another. Most of the time it is skipped, as
// signing in opens the last campaign used.
export function Campaigns() {
  const navigate = useNavigate()
  const { campaigns, loading, error, select } = useCampaign()

  if (loading) return <FullScreenSpinner />

  const hasCampaigns = campaigns.length > 0

  return (
    <FullScreenLayout>
      <Empty className="max-w-md gap-8">
        <EmptyHeader className="gap-3">
          <EmptyMedia className="mb-2">
            <LogoMark className="size-40" />
          </EmptyMedia>
          <EmptyTitle className="text-2xl">
            {hasCampaigns ? "Your campaigns" : "Welcome"}
          </EmptyTitle>
          <EmptyDescription>
            {hasCampaigns
              ? "Pick up where you left off, or start or join another."
              : "Start a campaign of your own as its GM, or join one with an invite link from your GM."}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="max-w-md gap-6">
          {hasCampaigns && (
            <ul className="w-full divide-y rounded-lg border text-left">
              {campaigns.map((campaign) => (
                <li key={campaign.id}>
                  <button
                    type="button"
                    className="hover:bg-muted/50 flex w-full cursor-pointer items-center gap-3 px-3 py-3 text-left transition-colors first:rounded-t-lg last:rounded-b-lg"
                    onClick={() => {
                      select(campaign.id)
                      navigate("/app")
                    }}
                  >
                    <CampaignAvatar
                      name={campaign.name}
                      imageUrl={campaign.imageUrl}
                      className="size-8 shrink-0"
                    />
                    <span className="flex-1 truncate text-sm font-medium">
                      {campaign.name}
                    </span>
                    <Badge variant="secondary">
                      {campaign.role === "gm" ? "GM" : "Player"}
                    </Badge>
                    <Icon src={arrow} className="text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex justify-center gap-2">
            <Button asChild>
              <Link to="/campaigns/new">Create a campaign</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/campaigns/join">Join with invite link</Link>
            </Button>
          </div>
          {error && <FormAlert tone="error">{error}</FormAlert>}
        </EmptyContent>
      </Empty>
    </FullScreenLayout>
  )
}
