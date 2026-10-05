import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ASSET_CATEGORIES, MAP_ASSETS, categoryLabel } from "@/lib/map-assets"
import { cn } from "@/lib/utils"
import { MapAssetTile } from "./MapAssetTile"

const ALL = "all"

type Props = { onPlace: (id: string) => void; disabled: boolean }

// The library, beside the canvas: a search, a tab for each category, and the
// art as tiles. The tabs are the folders of src/assets/map-assets.
export function MapAssetPanel({ onPlace, disabled }: Props) {
  const [category, setCategory] = useState(ALL)
  const [query, setQuery] = useState("")

  const shown = useMemo(() => {
    const text = query.trim().toLowerCase()
    return MAP_ASSETS.filter(
      (asset) =>
        (category === ALL || asset.category === category) &&
        (text === "" || asset.name.toLowerCase().includes(text))
    )
  }, [category, query])

  return (
    <aside
      className={cn(
        "flex w-64 shrink-0 flex-col border-l",
        disabled && "pointer-events-none opacity-60"
      )}
    >
      <div className="flex flex-col gap-3 p-4 pb-3">
        <h2 className="text-sm font-medium">Assets</h2>
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            aria-label="Search assets"
            className="pl-8"
          />
        </div>
        <div role="tablist" aria-label="Asset categories" className="flex flex-wrap gap-1">
          {[ALL, ...ASSET_CATEGORIES].map((tab) => (
            <button
              key={tab}
              role="tab"
              type="button"
              aria-selected={category === tab}
              onClick={() => setCategory(tab)}
              className={cn(
                "focus-visible:ring-ring rounded-md px-2.5 py-1 text-xs font-medium outline-none transition-colors focus-visible:ring-2",
                category === tab
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {tab === ALL ? "All" : categoryLabel(tab)}
            </button>
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin]">
        {shown.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-[13px]">
            {MAP_ASSETS.length === 0
              ? "No assets yet. Add images to src/assets/map-assets/<category>/."
              : "Nothing matches."}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {shown.map((asset) => (
              <MapAssetTile key={asset.id} asset={asset} onPlace={onPlace} />
            ))}
          </div>
        )}
        <p className="text-muted-foreground mt-3 text-xs">Click to place, or drag onto the map.</p>
      </div>
    </aside>
  )
}
