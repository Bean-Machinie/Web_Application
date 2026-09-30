import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronDown } from "lucide-react"
import warning from "@/assets/icons/warning.svg"
import { Icon } from "@/components/Icon"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useAuth } from "@/auth/useAuth"
import {
  canDeleteCampaign,
  canLeaveCampaign,
} from "@/lib/campaign-permissions"
import { errorMessage, leaveCampaign } from "@/lib/campaigns"
import type { Campaign } from "@/lib/campaigns"
import { cn } from "@/lib/utils"
import { ConfirmDialog } from "./ConfirmDialog"
import { DangerRow } from "./DangerRow"
import { DeleteCampaignDialog } from "./DeleteCampaignDialog"
import { useCampaign } from "./useCampaign"

// The creator can delete the campaign, everyone else can leave it. The
// database enforces the same rules, so this only decides what to show.
//
// It starts closed, and the buttons are not there until it is opened, so
// deleting or leaving is always at least two deliberate steps before the
// confirmation.
export function DangerZone({ campaign }: { campaign: Campaign }) {
  const userId = useAuth().session!.user.id
  const navigate = useNavigate()
  const { refresh } = useCampaign()
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isCreator = canDeleteCampaign(campaign, userId)

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
      <Collapsible
        open={open}
        onOpenChange={setOpen}
        className={cn(
          "bg-card overflow-hidden rounded-xl border transition-colors",
          open && "border-destructive/30"
        )}
      >
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="hover:bg-muted/40 focus-visible:ring-ring flex w-full cursor-pointer items-center gap-3 px-4 py-4 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset"
          >
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full transition-colors",
                open
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Icon src={warning} className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">Danger zone</span>
              <span className="text-muted-foreground block text-sm">
                {isCreator
                  ? "Delete this campaign permanently."
                  : "Leave this campaign."}
              </span>
            </span>
            <ChevronDown
              className={cn(
                "text-muted-foreground size-5 shrink-0 transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
          <div className="divide-y border-t">
            {isCreator && (
              <DangerRow
                title="Delete this campaign"
                description="Once you delete a campaign, there is no going back. Everyone in it loses access and is notified."
                action="Delete this campaign"
                onClick={() => setDeleting(true)}
              />
            )}
            {canLeaveCampaign(campaign, userId) && (
              <DangerRow
                title="Leave this campaign"
                description="You will lose access, and the GM will be told. To come back you will need a new invitation or invite link."
                action="Leave this campaign"
                onClick={() => setLeaving(true)}
              />
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

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
