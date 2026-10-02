import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { deleteCampaign, errorMessage } from "@/lib/campaigns"
import type { Campaign } from "@/lib/campaigns"
import { useCampaign } from "./useCampaign"

type Props = {
  campaign: Campaign
  open: boolean
  onClose: () => void
}

// Like GitHub: the button stays off until the campaign's name is typed out.
export function DeleteCampaignDialog({ campaign, open, onClose }: Props) {
  const navigate = useNavigate()
  const { refresh } = useCampaign()
  const [typed, setTyped] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setBusy(true)
    setError(null)
    try {
      await deleteCampaign(campaign, typed)
      await refresh()
      navigate("/app/campaigns")
    } catch (failure) {
      setError(errorMessage(failure))
      setBusy(false)
    }
  }

  function close() {
    if (busy) return
    setTyped("")
    setError(null)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>

        <div className="bg-destructive/10 text-destructive rounded-md px-3 py-2.5 text-sm">
          This permanently deletes <strong>{campaign.name}</strong>, its
          members, its invite link and any pending invitations. Everyone in it
          will be notified.
        </div>

        <div className="grid gap-2">
          <Label htmlFor="confirm-campaign-name">
            Type <strong>{campaign.name}</strong> to confirm.
          </Label>
          <Input
            id="confirm-campaign-name"
            autoComplete="off"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            disabled={busy}
          />
        </div>

        {error && <FormAlert tone="error">{error}</FormAlert>}

        <DialogFooter>
          <Button
            variant="destructive"
            className="w-full"
            disabled={busy || typed.trim() !== campaign.name}
            onClick={handleDelete}
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            I understand, delete this campaign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
