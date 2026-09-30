import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormAlert } from "@/components/auth/FormAlert"
import { CampaignFormPage } from "@/components/dashboard/CampaignFormPage"
import { useCampaign } from "@/components/dashboard/useCampaign"
import { errorMessage, joinCampaign, parseInviteCode } from "@/lib/campaigns"

export function JoinCampaign() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { refresh, select } = useCampaign()
  const [invite, setInvite] = useState(params.get("code") ?? "")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const campaignId = await joinCampaign(parseInviteCode(invite))
      await refresh()
      select(campaignId)
      navigate("/app")
    } catch (failure) {
      setError(errorMessage(failure))
      setBusy(false)
    }
  }

  return (
    <CampaignFormPage
      title="Join with invite link"
      description="Paste the link your GM sent you. You will join as a player."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="invite-link">Invite link</Label>
          <Input
            id="invite-link"
            required
            value={invite}
            onChange={(event) => setInvite(event.target.value)}
            disabled={busy}
          />
        </div>
        {error && <FormAlert tone="error">{error}</FormAlert>}
        <Button type="submit" disabled={busy || invite.trim() === ""}>
          {busy && <Loader2 className="size-4 animate-spin" />}
          Join campaign
        </Button>
      </form>
    </CampaignFormPage>
  )
}
