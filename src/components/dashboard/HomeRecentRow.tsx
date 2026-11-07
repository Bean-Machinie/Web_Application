import { Link } from "react-router-dom"
import { campaignPath } from "@/lib/campaign-paths"
import { shortAgo } from "@/lib/time"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { RecentEntry } from "@/lib/world-recent"

// One 40px row of Recently edited: a small picture or the kind's icon, the name, and what it is
// and when it was changed. The whole row opens the entry.
export function HomeRecentRow({ item }: { item: RecentEntry }) {
  const { entry, campaignId } = item
  const { icon: KindIcon, label } = WORLD_KINDS[entry.kind]
  const to = campaignId ? campaignPath(campaignId, `world/${entry.id}`) : `/app/library/${entry.id}`

  return (
    <Link to={to} className="hover:bg-accent/50 focus-visible:ring-ring flex h-10 items-center gap-3 rounded-md px-2 outline-none transition-colors focus-visible:ring-2">
      <span className="text-muted-foreground flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md">
        {entry.imageUrl ? <img src={entry.imageUrl} alt="" loading="lazy" className="size-full object-cover" /> : <KindIcon className="size-3.5" />}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-sm leading-tight">{entry.name}</span>
        <span className="text-muted-foreground truncate text-xs leading-tight">
          {label} · edited {shortAgo(entry.updatedAt)}
        </span>
      </span>
    </Link>
  )
}
