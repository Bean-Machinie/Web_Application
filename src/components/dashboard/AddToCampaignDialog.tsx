import { Loader2 } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { initialsOf } from "@/lib/profile"
import type { AddToCampaign } from "./useAddToCampaign"

// Which campaign to add the picked library entries to. Only campaigns the person
// manages the world of are listed.
export function AddToCampaignDialog({ target }: { target: AddToCampaign }) {
  const { items, campaigns, busy, error } = target
  const count = items?.length ?? 0

  return (
    <Dialog open={items !== null} onOpenChange={(open) => !open && !busy && target.close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to campaign</DialogTitle>
          <DialogDescription>
            {count === 1 ? items![0].name : `${count} entries`} will be copied into the world of the campaign you pick.
            They start hidden, and changing a copy does not change your library.
          </DialogDescription>
        </DialogHeader>
        {error && <FormAlert tone="error">{error}</FormAlert>}
        {campaigns.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            You do not manage the world of any campaign yet.
          </p>
        ) : (
          <ul className="flex max-h-80 flex-col gap-1 overflow-y-auto">
            {campaigns.map((campaign) => (
              <li key={campaign.id}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => target.add(campaign)}
                  className="hover:bg-accent focus-visible:ring-ring flex w-full items-center gap-3 rounded-lg p-2 text-left outline-none focus-visible:ring-2 disabled:opacity-60"
                >
                  <span className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border text-xs font-semibold">
                    {campaign.imageUrl ? (
                      <img src={campaign.imageUrl} alt="" className="size-full object-cover" />
                    ) : (
                      initialsOf(campaign.name) || "?"
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">{campaign.name}</span>
                  {busy && <Loader2 className="text-muted-foreground size-4 animate-spin" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  )
}
