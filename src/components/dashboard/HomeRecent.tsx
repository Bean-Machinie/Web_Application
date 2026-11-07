import { useMemo } from "react"
import { Link } from "react-router-dom"
import { useRecentEntries } from "@/hooks/use-recent-entries"
import { can } from "@/lib/campaign-permissions"
import { HomeRecentRow } from "./HomeRecentRow"
import { HomeSideHeader } from "./HomeSideHeader"
import { useCampaign } from "./useCampaign"

const SHOWN = 8

// What you changed last, in your library and in the campaigns whose world you run: no panel, just
// a hairline at the left and the rows.
export function HomeRecent() {
  const { campaigns } = useCampaign()
  const ids = useMemo(() => campaigns.filter((campaign) => can(campaign.role, "manage_world")).map((campaign) => campaign.id), [campaigns])
  const { entries } = useRecentEntries(ids, "updated", SHOWN)

  return (
    <aside className="flex flex-col gap-2 border-l pl-6">
      <HomeSideHeader title="Recently edited">
        <Link to="/app/library" className="hover:text-foreground transition-colors">
          Library →
        </Link>
      </HomeSideHeader>
      <div className="flex flex-col">
        {entries?.length === 0 && <p className="text-muted-foreground px-2 py-3 text-xs">Nothing edited yet.</p>}
        {entries?.map((item) => <HomeRecentRow key={item.entry.id} item={item} />)}
      </div>
    </aside>
  )
}
