import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormAlert } from "@/components/auth/FormAlert"
import { CampaignFormPage } from "@/components/dashboard/CampaignFormPage"
import { useCampaign } from "@/components/dashboard/useCampaign"
import { createCampaign, errorMessage } from "@/lib/campaigns"

export function NewCampaign() {
  const navigate = useNavigate()
  const { refresh, select } = useCampaign()
  const [name, setName] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const campaign = await createCampaign(name)
      await refresh()
      select(campaign.id)
      navigate("/app")
    } catch (failure) {
      setError(errorMessage(failure))
      setBusy(false)
    }
  }

  return (
    <CampaignFormPage
      title="New campaign"
      description="You will be the GM and can invite players afterwards."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="campaign-name">Campaign name</Label>
          <Input
            id="campaign-name"
            required
            maxLength={60}
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={busy}
          />
        </div>
        {error && <FormAlert tone="error">{error}</FormAlert>}
        <Button type="submit" disabled={busy || name.trim() === ""}>
          {busy && <Loader2 className="size-4 animate-spin" />}
          Create campaign
        </Button>
      </form>
    </CampaignFormPage>
  )
}
