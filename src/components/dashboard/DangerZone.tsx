import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/auth/useAuth"
import {
  canDeleteCampaign,
  canLeaveCampaign,
} from "@/lib/campaign-permissions"
import { errorMessage, leaveCampaign } from "@/lib/campaigns"
import type { Campaign } from "@/lib/campaigns"
import { ConfirmDialog } from "./ConfirmDialog"
import { DeleteCampaignDialog } from "./DeleteCampaignDialog"
import { useCampaign } from "./useCampaign"

type RowProps = {
  title: string
  description: string
  action: string
  onClick: () => void
}

function Row({ title, description, action, onClick }: RowProps) {
  return (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>
      </div>
      <Button
        variant="outline"
        className="text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive shrink-0"
        onClick={onClick}
      >
        {action}
      </Button>
    </div>
  )
}

// Like GitHub's: the creator can delete the campaign, everyone else can leave
// it. The database enforces the same rules, so this only decides what to show.
export function DangerZone({ campaign }: { campaign: Campaign }) {
  const userId = useAuth().session!.user.id
  const navigate = useNavigate()
  const { refresh } = useCampaign()
  const [deleting, setDeleting] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    <section className="pt-10">
      <h3 className="text-destructive text-sm font-semibold">Danger zone</h3>
      <div className="border-destructive/40 mt-3 divide-y rounded-lg border">
        {canDeleteCampaign(campaign, userId) && (
          <Row
            title="Delete this campaign"
            description="Once you delete a campaign, there is no going back. Everyone in it loses access and is notified."
            action="Delete this campaign"
            onClick={() => setDeleting(true)}
          />
        )}
        {canLeaveCampaign(campaign, userId) && (
          <Row
            title="Leave this campaign"
            description="You will lose access, and the GM will be told. To come back you will need a new invitation or invite link."
            action="Leave this campaign"
            onClick={() => setLeaving(true)}
          />
        )}
      </div>

      <DeleteCampaignDialog
        campaign={campaign}
        open={deleting}
        onClose={() => setDeleting(false)}
      />
      <ConfirmDialog
        open={leaving}
        title={`Leave ${campaign.name}?`}
        description="You will lose access to this campaign straight away, and the GM will be told that you left."
        confirmLabel="Leave campaign"
        busy={busy}
        error={error}
        onCancel={() => {
          setLeaving(false)
          setError(null)
        }}
        onConfirm={handleLeave}
      />
    </section>
  )
}
