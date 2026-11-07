import { LayoutGrid } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { WorldEntry } from "@/lib/world-entries"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { TabNav } from "./TabNav"
import { useWorldScope } from "./useWorldScope"

type Props = {
  entries: WorldEntry[] | null
  active: WorldEntryKind | null
}

// All, then one tab per registry kind. The active tab lives in the URL. Where the panel is too
// narrow for the tabs, one drop-down holds them, as the map maker's categories are.
export function WorldTabs({ entries, active }: Props) {
  const scope = useWorldScope()
  const navigate = useNavigate()
  const count = (kind: WorldEntryKind | null) => entries && (kind ? entries.filter((entry) => entry.kind === kind).length : entries.length)

  const tabs = [
    { label: "All", icon: LayoutGrid, to: scope.basePath, isActive: active === null, count: count(null) },
    ...scope.kinds.map((kind) => ({
      label: WORLD_KINDS[kind].plural,
      icon: WORLD_KINDS[kind].icon,
      to: `${scope.basePath}?kind=${kind}`,
      isActive: active === kind,
      count: count(kind),
    })),
  ]
  const current = tabs.find((tab) => tab.isActive) ?? tabs[0]

  return (
    <>
      <div className="hidden min-w-0 @7xl:block">
        <TabNav label={scope.label} tabs={tabs.map((tab) => ({ ...tab, badge: tab.count !== null && <Badge variant="secondary">{tab.count}</Badge> }))} bare />
      </div>
      <div className="my-auto w-44 @7xl:hidden">
        <Select value={current.to} onValueChange={(to) => navigate(to)}>
          <SelectTrigger aria-label="Kind" className="w-full *:data-[slot=select-value]:w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={2} align="start" className="w-(--radix-select-trigger-width) shadow-lg">
            {tabs.map(({ to, label, icon: Icon, count: total }, index) => (
              <div key={to} className={index <= 1 ? "px-1" : "px-1 last:pb-1"}>
                {index === 0 && <div className="h-1" />}
                <SelectItem value={to} className="rounded-md *:[span]:last:flex-1">
                  <Icon className="text-muted-foreground" />
                  <span className="truncate">{label}</span>
                  <span className="text-muted-foreground ml-auto pl-3 text-xs tabular-nums">{total}</span>
                </SelectItem>
                {index === 0 && <SelectSeparator className="bg-border-strong -mx-1 my-1" />}
              </div>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  )
}
