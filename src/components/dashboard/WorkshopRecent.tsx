import { useEffect, useMemo, useState } from "react"
import { LoadingGate } from "@/components/LoadingGate"
import { useHadRecent } from "@/hooks/use-had-recent"
import { useRecentEntries } from "@/hooks/use-recent-entries"
import { can } from "@/lib/campaign-permissions"
import { dayGroup } from "@/lib/time"
import type { RecentBy, RecentEntry } from "@/lib/world-recent"
import { RecentCard } from "./RecentCard"
import { RecentRow } from "./RecentRow"
import { RecentRowsSkeleton } from "./RecentRowsSkeleton"
import { useCampaign } from "./useCampaign"

const SHOWN = 10
// What the skeleton shows before anything has loaded.
const FIRST_LOAD = [3, 4]
// Beside the campaigns its top lines up with the toolbar: under the heading row
// (2.25rem) and the gap below it (1rem).
const SIDE = "xl:mt-[3.25rem] xl:w-[340px] xl:shrink-0"

// Rows are grouped by the day they are dated by, in the order they come.
function groupByDay(items: RecentEntry[], by: RecentBy) {
  const groups: { label: string; items: RecentEntry[] }[] = []
  for (const item of items) {
    const label = dayGroup(by === "updated" ? item.entry.updatedAt : item.entry.createdAt)
    const last = groups[groups.length - 1]
    if (last?.label === label) last.items.push(item)
    else groups.push({ label, items: [item] })
  }
  return groups
}

// "Recent" beside the campaigns (under them on a narrow screen), in a card like the
// campaign cards: the newest entries in your library and in the campaigns you run, by
// when they were changed or made, grouped by day. The card stays put when the sort
// changes: the rows turn into a skeleton of the same shape while the new ones load.
// Whether room is made for it before loading follows what it held last time, so the
// campaigns beside it do not shift. With nothing to show it takes no room at all.
export function HomeRecent() {
  const { campaigns } = useCampaign()
  const [by, setBy] = useState<RecentBy>("updated")
  const running = useMemo(
    () => campaigns.filter((campaign) => can(campaign.role, "manage_world")),
    [campaigns]
  )
  const { entries, loading } = useRecentEntries(
    useMemo(() => running.map((campaign) => campaign.id), [running]),
    by,
    SHOWN
  )
  const names = useMemo(() => new Map(running.map((campaign) => [campaign.id, campaign.name])), [running])
  // Of what is on screen, which stands in for the rows while others load.
  const groups = useMemo(() => (entries ? groupByDay(entries, by) : []), [entries, by])
  const [hadRecent, rememberHadRecent] = useHadRecent()

  useEffect(() => {
    if (entries) rememberHadRecent(entries.length > 0)
  }, [entries, rememberHadRecent])

  return (
    <LoadingGate
      loading={entries === null}
      className={
        entries ? (entries.length > 0 ? SIDE : "hidden") : hadRecent ? SIDE : "hidden"
      }
      skeleton={
        <RecentCard by={by} onBy={setBy}>
          <RecentRowsSkeleton groups={FIRST_LOAD} />
        </RecentCard>
      }
    >
      {() =>
        entries &&
        entries.length > 0 && (
          <RecentCard by={by} onBy={setBy}>
            {loading ? (
              <RecentRowsSkeleton groups={groups.map((group) => group.items.length)} />
            ) : (
              groups.map((group) => (
                <div key={group.label} className="flex flex-col">
                  <h3 className="text-muted-foreground px-2 pt-2 pb-1 text-xs font-medium">{group.label}</h3>
                  {group.items.map((item) => (
                    <RecentRow
                      key={item.entry.id}
                      item={item}
                      campaignName={item.campaignId ? (names.get(item.campaignId) ?? null) : null}
                      by={by}
                    />
                  ))}
                </div>
              ))
            )}
          </RecentCard>
        )
      }
    </LoadingGate>
  )
}
