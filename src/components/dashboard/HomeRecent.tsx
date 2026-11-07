import { useMemo } from "react"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { useRecentEntries } from "@/hooks/use-recent-entries"
import { can } from "@/lib/campaign-permissions"
import { HomeRecentRow } from "./HomeRecentRow"
import { useCampaign } from "./useCampaign"

const SHOWN = 20

// What you changed last, in your library and in the campaigns whose world you run, in a solid
// panel. It fills the height of the column it is in, and its list scrolls inside it.
export function HomeRecent() {
  const { campaigns } = useCampaign()
  const ids = useMemo(() => campaigns.filter((campaign) => can(campaign.role, "manage_world")).map((campaign) => campaign.id), [campaigns])
  const { entries } = useRecentEntries(ids, "updated", SHOWN)

  return (
    <aside className="bg-popover text-popover-foreground ring-foreground/10 flex max-h-[480px] flex-col overflow-hidden rounded-xl shadow-md ring-1 lg:absolute lg:inset-0 lg:max-h-none">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Recently edited</h2>
        <Link to="/app/library" className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors">
          Library
          <ArrowRight className="size-4" />
        </Link>
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto p-2 [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin]">
        {entries?.length === 0 && <p className="text-muted-foreground px-2 py-6 text-center text-sm">Nothing edited yet.</p>}
        {entries?.map((item) => <HomeRecentRow key={item.entry.id} item={item} />)}
      </div>
    </aside>
  )
}
