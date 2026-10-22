import { Link } from "react-router-dom"
import { campaignPath } from "@/lib/campaign-paths"
import { shortAgo } from "@/lib/time"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { RecentBy, RecentEntry } from "@/lib/world-recent"

type Props = {
  item: RecentEntry
  // The campaign it is in; null for the library.
  campaignName: string | null
  by: RecentBy
}

// One row of the recent list, about 48px: a small picture or the kind's icon, the name
// over what it is and where it lives, and the time at the right. The whole row opens
// the entry.
export function RecentRow({ item, campaignName, by }: Props) {
  const { entry, campaignId } = item
  const { icon: KindIcon, label } = WORLD_KINDS[entry.kind]
  const to = campaignId ? campaignPath(campaignId, `world/${entry.id}`) : `/app/library/${entry.id}`

  return (
    <Link
      to={to}
      className="hover:bg-accent/50 focus-visible:ring-ring flex items-center gap-3 rounded-md px-2 py-2 outline-none focus-visible:ring-2"
    >
      <span className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md">
        {entry.imageUrl ? (
          <img src={entry.imageUrl} alt="" loading="lazy" className="size-full object-cover" />
        ) : (
          <KindIcon className="size-4" />
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium">{entry.name}</span>
        <span className="text-muted-foreground truncate text-xs">
          {label} · {campaignName ?? "Library"}
        </span>
      </span>
      <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
        {shortAgo(by === "updated" ? entry.updatedAt : entry.createdAt)}
      </span>
    </Link>
  )
}
