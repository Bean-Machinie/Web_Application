import { useState } from "react"
import { Loader2 } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { Button } from "@/components/ui/button"
import { errorMessage } from "@/lib/campaigns"
import type { Invitation } from "@/lib/invitations"
import { CampaignAvatar } from "./CampaignAvatar"
import { useCampaign } from "./useCampaign"

export function InvitationItem({ invitation }: { invitation: Invitation }) {
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

  return (
    <li className="flex flex-col gap-3 px-4 py-4">
      <div className="flex items-center gap-4">
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
            {new Date(invitation.createdAt).toLocaleDateString()}
          </p>
        </div>
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
      </div>
      {error && <FormAlert tone="error">{error}</FormAlert>}
    </li>
  )
}
