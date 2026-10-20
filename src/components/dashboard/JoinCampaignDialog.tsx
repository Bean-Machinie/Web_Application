import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { parseInviteCode } from "@/lib/campaigns"

type Props = { open: boolean; onOpenChange: (open: boolean) => void }

// Pasting a link only leads to the Accept or Decline screen at /invite.
export function JoinCampaignDialog({ open, onOpenChange }: Props) {
  const navigate = useNavigate()
  const [invite, setInvite] = useState("")

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    navigate(`/invite?code=${encodeURIComponent(parseInviteCode(invite))}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Join with invite link</DialogTitle>
          <DialogDescription>Paste the link your GM sent you.</DialogDescription>
        </DialogHeader>
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
      </DialogContent>
    </Dialog>
  )
}
