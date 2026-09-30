import { useState } from "react"
import { ChevronDown } from "lucide-react"
import warning from "@/assets/icons/warning.svg"
import { Icon } from "@/components/Icon"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import type { Campaign } from "@/lib/campaigns"
import { cn } from "@/lib/utils"
import { DeleteCampaignDialog } from "./DeleteCampaignDialog"

// Starts closed and the button is not there until it is opened, so deleting
// is always at least two deliberate steps before the typed confirmation.
export function DangerZone({ campaign }: { campaign: Campaign }) {
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  return (
    <section className="flex flex-col gap-3 pt-10">
      <h3 className="text-destructive text-sm font-semibold">Danger Zone</h3>
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
              <span className="block text-sm font-medium">Delete Campaign</span>
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
          <div className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <p className="text-muted-foreground text-sm">
              Once you delete a campaign, there is no going back. Everyone in it
              loses access and is notified.
            </p>
            <Button
              variant="destructive"
              className="shrink-0"
              onClick={() => setDeleting(true)}
            >
              Delete this campaign
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <DeleteCampaignDialog
        campaign={campaign}
        open={deleting}
        onClose={() => setDeleting(false)}
      />
    </section>
  )
}
