import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/auth/useAuth"
import { Button } from "@/components/ui/button"
import { canLeaveCampaign } from "@/lib/campaign-permissions"
import { errorMessage, leaveCampaign } from "@/lib/campaigns"
import type { Campaign } from "@/lib/campaigns"
import { ConfirmDialog } from "./ConfirmDialog"
import { useCampaign } from "./useCampaign"

// The owner cannot leave (they delete or transfer instead), so the button is
// not shown to them. The database enforces the same rule.
export function LeaveCampaignButton({ campaign }: { campaign: Campaign }) {
  const userId = useAuth().session!.user.id
  const navigate = useNavigate()
  const { refresh } = useCampaign()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!canLeaveCampaign(campaign, userId)) return null

  async function handleLeave() {
    setBusy(true)
    setError(null)
    try {
      await leaveCampaign(campaign.id)
      await refresh()
      navigate("/app/campaigns")
    } catch (failure) {
      setError(errorMessage(failure))
      setBusy(false)
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Leave campaign
      </Button>
      <ConfirmDialog
        open={open}
        title={`Leave ${campaign.name}?`}
        description="You will lose access to this campaign straight away, and the GM will be told that you left."
        confirmLabel="Leave campaign"
        busy={busy}
        error={error}
        onCancel={() => {
          setOpen(false)
          setError(null)
        }}
        onConfirm={handleLeave}
      />
    </>
  )
}
