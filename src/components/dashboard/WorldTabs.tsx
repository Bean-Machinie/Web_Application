import { Badge } from "@/components/ui/badge"
import type { WorldEntry } from "@/lib/world-entries"
import { WORLD_KINDS, worldKinds } from "@/lib/world-kinds"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { TabNav } from "./TabNav"

type Props = {
  entries: WorldEntry[] | null
  active: WorldEntryKind | null
}

// All, then one tab per registry kind. The active tab lives in the URL.
export function WorldTabs({ entries, active }: Props) {
  const count = (kind: WorldEntryKind | null) =>
    entries && (
      <Badge variant="secondary">
        {kind ? entries.filter((entry) => entry.kind === kind).length : entries.length}
      </Badge>
    )

  const tabs = [
    { label: "All", to: "/app/world", isActive: active === null, badge: count(null) },
    ...worldKinds.map((kind) => ({
      label: WORLD_KINDS[kind].plural,
      to: `/app/world?kind=${kind}`,
      isActive: active === kind,
      badge: count(kind),
    })),
  ]

  return <TabNav label="World" tabs={tabs} />
}
