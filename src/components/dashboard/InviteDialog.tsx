import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { InviteLinkSection } from "./InviteLinkSection"
import { InvitePeople } from "./InvitePeople"

type Props = {
  campaignId: string
  open: boolean
  onClose: () => void
  onInvited: () => void
}

export function InviteDialog({ campaignId, open, onClose, onInvited }: Props) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      {/* minmax(0, 1fr) keeps long content from stretching past the dialog. */}
      <DialogContent className="grid-cols-[minmax(0,1fr)] gap-5 p-6 sm:max-w-md">
        <DialogHeader className="gap-1">
          <DialogTitle className="text-base">Invite people</DialogTitle>
          <DialogDescription>
            Search by username or email to send an invitation.
          </DialogDescription>
        </DialogHeader>

        <InvitePeople campaignId={campaignId} onInvited={onInvited} />

        <div className="border-t pt-4">
          <InviteLinkSection campaignId={campaignId} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
