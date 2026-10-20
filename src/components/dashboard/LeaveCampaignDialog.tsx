import { useState } from "react"
import { errorMessage, leaveCampaign } from "@/lib/campaigns"
import type { Campaign } from "@/lib/campaigns"
import { ConfirmDialog } from "./ConfirmDialog"
import { useCampaign } from "./useCampaign"

type Props = { campaign: Campaign | null; onClose: () => void }

// Leaving from the list: the same rules as the Leave button inside a
// campaign, but opened from a menu.
export function LeaveCampaignDialog({ campaign, onClose }: Props) {
  const { refresh } = useCampaign()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLeave() {
    setBusy(true)
    setError(null)
    try {
      await leaveCampaign(campaign!.id)
      await refresh()
      onClose()
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setBusy(false)
    }
  }

  return (
    <ConfirmDialog
      open={campaign !== null}
      title={`Leave ${campaign?.name ?? "campaign"}?`}
      description="You will lose access to this campaign straight away, and the GM will be told that you left."
      confirmLabel="Leave campaign"
      busy={busy}
      error={error}
      onCancel={() => {
        setError(null)
        onClose()
      }}
      onConfirm={handleLeave}
    />
  )
}
