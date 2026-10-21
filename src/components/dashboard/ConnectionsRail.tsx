import { Badge } from "@/components/ui/badge"
import { GROUP_ORDER } from "@/lib/connection-groups"
import type { Connections } from "@/lib/connection-groups"
import { cn } from "@/lib/utils"
import { ConnectionRailGroup } from "./ConnectionRailGroup"
import { THIN_SCROLL } from "./entry-layout"

type Props = {
  entryId: string
  name: string
  connections: Connections
}

// What an entry is connected to, in a card: what it mentions, what mentions it, the
// maps it is pinned on and, for a map, what is pinned on it. The page only shows it
// when there is something to show. The card is the facts card's: same fill, border
// and radius. When the content area is wide enough (see WorldEntryPage) it is the
// third cell of the top row, as tall as the image and the facts card, and if the
// connections do not fit the list scrolls and the header stays. Narrower, it is a
// card under the fields. It scrolls with the page, and it reads what the database
// returns for the viewer, adding nothing to it.
export function ConnectionsRail({ entryId, name, connections }: Props) {
  return (
    // At the wide size the card fills the cell without adding to its height, which
    // the image and the facts decide.
    <aside
      aria-label="Connections"
      className="relative col-span-full min-w-0 pb-4 @5xl:col-span-1 @5xl:col-start-3 @5xl:row-start-2 @5xl:pb-0"
    >
      <div className="bg-card flex min-w-0 flex-col overflow-hidden rounded-lg border shadow-xs @5xl:absolute @5xl:inset-0">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b px-4 py-2.5">
          <h3 className="text-sm font-medium">Connections</h3>
          <Badge variant="secondary">{connections.total}</Badge>
        </div>
        <div className={cn("min-h-0 flex-1 overflow-x-hidden overflow-y-auto", THIN_SCROLL)}>
          <div className="grid min-w-0 gap-4 p-2">
            {GROUP_ORDER.filter((key) => connections.groups[key].length > 0).map((key) => (
              <ConnectionRailGroup
                key={key}
                group={key}
                rows={connections.groups[key]}
                from={{ id: entryId, name }}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
