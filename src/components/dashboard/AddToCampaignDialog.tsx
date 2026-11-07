import { FormAlert } from "@/components/auth/FormAlert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CampaignPickList } from "./CampaignPickList"
import type { AddToCampaign } from "./useAddToCampaign"

// Which campaign to add the picked library entries to. Only campaigns the person
// manages the world of are listed.
export function AddToCampaignDialog({ target }: { target: AddToCampaign }) {
  const { items, campaigns, busy, error } = target
  const count = items?.length ?? 0

  return (
    <Dialog open={items !== null} onOpenChange={(open) => !open && !busy && target.close()}>
      <DialogContent className="sm:max-w-md" onOpenAutoFocus={(event) => event.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Add to campaign</DialogTitle>
          <DialogDescription>
            {count === 1 ? items![0].name : `${count} entries`} will be copied into the world of the campaign you pick.
            They start hidden, and changing a copy does not change your library.
          </DialogDescription>
        </DialogHeader>
        {error && <FormAlert tone="error">{error}</FormAlert>}
        <CampaignPickList campaigns={campaigns} busy={busy} onPick={target.add} />
      </DialogContent>
    </Dialog>
  )
}
