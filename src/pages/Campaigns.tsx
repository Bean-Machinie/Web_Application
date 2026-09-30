import { Link, useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import arrow from "@/assets/icons/arrow.svg"
import bell from "@/assets/icons/bell.svg"
import { FormAlert } from "@/components/auth/FormAlert"
import { CampaignAvatar } from "@/components/dashboard/CampaignAvatar"
import { useCampaign } from "@/components/dashboard/useCampaign"
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

// Every campaign you belong to. It is where someone with no campaign lands.
// Creating and joining live in the campaign menu in the sidebar; the buttons
// here only appear while that menu would be the only other place to look.
export function Campaigns() {
  const navigate = useNavigate()
  const { campaigns, loading, error, select, unreadCount } = useCampaign()
  const waiting = unreadCount

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="text-muted-foreground size-5 animate-spin" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Campaigns</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          The campaigns you are part of.
        </p>
      </div>

      {waiting > 0 && (
        <div className="bg-muted/40 flex items-center gap-3 rounded-lg border px-4 py-3">
          <Icon src={bell} className="text-muted-foreground size-5" />
          <p className="flex-1 text-sm">
            You have {waiting === 1 ? "an unread notification" : `${waiting} unread notifications`}.
          </p>
          <Button asChild size="sm" variant="outline">
            <Link to="/app/settings/notifications">View</Link>
          </Button>
        </div>
      )}

      {error && <FormAlert tone="error">{error}</FormAlert>}

      {campaigns.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader className="gap-3">
            <EmptyMedia className="mb-2">
              <LogoMark className="size-32" />
            </EmptyMedia>
            <EmptyTitle className="text-xl">No campaign yet</EmptyTitle>
            <EmptyDescription>
              Start a campaign of your own as its GM, or join one with an
              invite link from your GM.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center gap-2">
            <Button asChild>
              <Link to="/app/campaigns/new">Create a campaign</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/app/campaigns/join">Join with invite link</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <ul className="divide-y rounded-lg border">
          {campaigns.map((campaign) => (
            <li key={campaign.id}>
              <button
                type="button"
                className="hover:bg-muted/50 flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors first:rounded-t-lg last:rounded-b-lg"
                onClick={() => {
                  select(campaign.id)
                  navigate("/app")
                }}
              >
                <CampaignAvatar
                  name={campaign.name}
                  imageUrl={campaign.imageUrl}
                  className="size-10 shrink-0"
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
    </div>
  )
}
