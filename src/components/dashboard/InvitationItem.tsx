import { useState } from "react"
import { Loader2 } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { Button } from "@/components/ui/button"
import { errorMessage } from "@/lib/campaigns"
import type { Invitation } from "@/lib/invitations"
import { timeAgo } from "@/lib/time"
import { cn } from "@/lib/utils"
import { CampaignAvatar } from "./CampaignAvatar"
import { useCampaign } from "./useCampaign"

type Props = {
  invitation: Invitation
  // Puts the buttons under the text, for narrow spaces such as the bell menu.
  compact?: boolean
}

export function InvitationItem({ invitation, compact }: Props) {
  const { respond } = useCampaign()
  const [busy, setBusy] = useState<"accept" | "decline" | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function answer(accept: boolean) {
    setBusy(accept ? "accept" : "decline")
    setError(null)
    try {
      await respond(invitation.id, accept)
    } catch (failure) {
      setError(errorMessage(failure))
      setBusy(null)
    }
  }

  const buttons = (
    <div className="flex shrink-0 gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={busy !== null}
        onClick={() => answer(false)}
      >
        {busy === "decline" && <Loader2 className="size-4 animate-spin" />}
        Decline
      </Button>
      <Button size="sm" disabled={busy !== null} onClick={() => answer(true)}>
        {busy === "accept" && <Loader2 className="size-4 animate-spin" />}
        Accept
      </Button>
    </div>
  )

  return (
    <li className="flex flex-col gap-3 px-4 py-4">
      <div className="flex items-start gap-3">
        <CampaignAvatar
          name={invitation.campaignName}
          imageUrl={invitation.campaignImageUrl}
          className="size-10 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm">
            <span className="font-medium">{invitation.invitedByName}</span>{" "}
            invited you to join{" "}
            <span className="font-medium">{invitation.campaignName}</span>
          </p>
          <p className="text-muted-foreground text-xs">
            {timeAgo(invitation.createdAt)}
          </p>
          {compact && <div className="mt-3">{buttons}</div>}
        </div>
        {!compact && <div className={cn("self-center")}>{buttons}</div>}
      </div>
      {error && <FormAlert tone="error">{error}</FormAlert>}
    </li>
  )
}
