import { ChevronRight, Loader2 } from "lucide-react"
import type { Campaign } from "@/lib/campaigns"
import { initialsOf } from "@/lib/profile"

type Props = { campaigns: Campaign[]; busy: boolean; onPick: (campaign: Campaign) => void }

// The campaigns to choose from in "Add to campaign", the same wherever it is asked: a row each with
// its picture (or initials) and name. Only campaigns whose world the person manages are passed.
export function CampaignPickList({ campaigns, busy, onPick }: Props) {
  if (campaigns.length === 0) {
    return <p className="text-muted-foreground py-6 text-center text-sm">You do not manage the world of any campaign yet.</p>
  }

  return (
    <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto">
      {campaigns.map((campaign) => (
        <li key={campaign.id}>
          <button
            type="button"
            disabled={busy}
            onClick={() => onPick(campaign)}
            className="hover:bg-muted focus-visible:ring-ring flex w-full items-center gap-3 rounded-lg border p-2 text-left transition-colors outline-none focus-visible:ring-2 disabled:opacity-60"
          >
            <span className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border text-xs font-semibold">
              {campaign.imageUrl ? <img src={campaign.imageUrl} alt="" className="size-full object-cover" /> : initialsOf(campaign.name) || "?"}
            </span>
            <span className="min-w-0 flex-1 truncate font-medium">{campaign.name}</span>
            {busy ? <Loader2 className="text-muted-foreground size-4 animate-spin" /> : <ChevronRight className="text-muted-foreground size-4" />}
          </button>
        </li>
      ))}
    </ul>
  )
}
