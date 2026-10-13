import { Badge } from "@/components/ui/badge"
import type { WorldEntry } from "@/lib/world-entries"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { TabNav } from "./TabNav"
import { useWorldScope } from "./useWorldScope"

type Props = {
  entries: WorldEntry[] | null
  active: WorldEntryKind | null
}

// All, then one tab per registry kind. The active tab lives in the URL.
export function WorldTabs({ entries, active }: Props) {
  const scope = useWorldScope()
  const count = (kind: WorldEntryKind | null) =>
    entries && (
      <Badge variant="secondary">
        {kind ? entries.filter((entry) => entry.kind === kind).length : entries.length}
      </Badge>
    )

  const tabs = [
    { label: "All", to: scope.basePath, isActive: active === null, badge: count(null) },
    ...scope.kinds.map((kind) => ({
      label: WORLD_KINDS[kind].plural,
      to: `${scope.basePath}?kind=${kind}`,
      isActive: active === kind,
      badge: count(kind),
    })),
  ]

  return <TabNav label={scope.label} tabs={tabs} />
}
