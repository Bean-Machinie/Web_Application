import { useState } from "react"
import { Navigate, useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CampaignFormPage } from "@/components/dashboard/CampaignFormPage"
import { parseInviteCode } from "@/lib/campaigns"

// Pasting a link only leads to the Accept or Decline screen at /invite.
export function JoinCampaign() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [invite, setInvite] = useState("")

  // Links from before the invite page existed still work.
  const oldCode = params.get("code")
  if (oldCode) return <Navigate to={`/invite?code=${oldCode}`} replace />

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    navigate(`/invite?code=${encodeURIComponent(parseInviteCode(invite))}`)
  }

  return (
    <CampaignFormPage
      title="Join with invite link"
      description="Paste the link your GM sent you."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="invite-link">Invite link</Label>
          <Input
            id="invite-link"
            required
            value={invite}
            onChange={(event) => setInvite(event.target.value)}
          />
        </div>
        <Button type="submit" disabled={invite.trim() === ""}>
          Continue
        </Button>
      </form>
    </CampaignFormPage>
  )
}
