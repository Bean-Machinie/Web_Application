import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { InviteLinkSection } from "./InviteLinkSection"
import { InviteUserSearch } from "./InviteUserSearch"

type Props = {
  campaignId: string
  open: boolean
  onClose: () => void
  onInvited: () => void
}

export function InviteDialog({ campaignId, open, onClose, onInvited }: Props) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite to campaign</DialogTitle>
          <DialogDescription>
            Invite someone by email or username, or share the invite link.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          <h4 className="text-sm font-medium">Invite a person</h4>
          <p className="text-muted-foreground text-sm">
            They get the invitation under Notifications.
          </p>
          <InviteUserSearch campaignId={campaignId} onInvited={onInvited} />
        </div>

        <div className="grid gap-2">
          <h4 className="text-sm font-medium">Invite link</h4>
          <p className="text-muted-foreground text-sm">
            Anyone with the link can join as a player. It does not expire, but
            resetting it disables the old link.
          </p>
          <InviteLinkSection campaignId={campaignId} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
