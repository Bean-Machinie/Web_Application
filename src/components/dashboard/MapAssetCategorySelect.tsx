import { LayoutGrid } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ASSET_CATEGORIES, MAP_ASSETS, categoryLabel } from "@/lib/map-assets"
import { FadingScroll } from "./FadingScroll"
import { categoryIcon } from "./map-category-icons"

export const ALL_CATEGORIES = "all"

const COUNTS = new Map<string, number>()
for (const asset of MAP_ASSETS) COUNTS.set(asset.category, (COUNTS.get(asset.category) ?? 0) + 1)

function Row({ icon: Icon, label, count }: { icon: LucideIcon; label: string; count: number }) {
  return (
    <>
      <Icon className="text-muted-foreground" />
      <span className="truncate">{label}</span>
      <span className="text-muted-foreground ml-auto pl-3 text-xs tabular-nums">{count}</span>
    </>
  )
}

// The category list, opening just under its trigger at the trigger's width.
export function MapAssetCategorySelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger size="sm" aria-label="Category" className="w-full *:data-[slot=select-value]:w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        position="popper"
        sideOffset={2}
        align="start"
        className="w-(--radix-select-trigger-width) overflow-hidden shadow-lg"
      >
        <div className="px-1 pt-1">
          <SelectItem value={ALL_CATEGORIES} className="rounded-md *:[span]:last:flex-1">
            <Row icon={LayoutGrid} label="All categories" count={MAP_ASSETS.length} />
          </SelectItem>
          <SelectSeparator className="mt-1 mb-0" />
        </div>
        <FadingScroll maxHeight="min(16rem, var(--radix-select-content-available-height))">
          <div className="p-1">
            {ASSET_CATEGORIES.map((name) => (
              <SelectItem key={name} value={name} className="rounded-md *:[span]:last:flex-1">
                <Row icon={categoryIcon(name)} label={categoryLabel(name)} count={COUNTS.get(name) ?? 0} />
              </SelectItem>
            ))}
          </div>
        </FadingScroll>
      </SelectContent>
    </Select>
  )
}
