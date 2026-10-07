import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ASSET_CATEGORIES, MAP_ASSETS, categoryLabel } from "@/lib/map-assets"
import { cn } from "@/lib/utils"
import { MapAssetTile } from "./MapAssetTile"

const ALL = "all"

type Props = {
  armed: string | null
  onArm: (id: string) => void
  // The least width of a tile, in pixels.
  tileSize: number
  viewScale: number
  disabled: boolean
}

// The library: a search, a list of the categories, and the art as tiles. The
// categories are the folders of src/assets/map-assets.
export function MapAssetPanel({ armed, onArm, tileSize, viewScale, disabled }: Props) {
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
    <section
      aria-label="Assets"
      className={cn("flex flex-col", disabled && "pointer-events-none opacity-60")}
    >
      <div className="bg-background sticky top-8 z-10 flex flex-col gap-2 p-3 pb-2">
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
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger size="sm" aria-label="Category" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All categories</SelectItem>
            {ASSET_CATEGORIES.map((name) => (
              <SelectItem key={name} value={name}>
                {categoryLabel(name)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {armed && <p className="text-muted-foreground text-xs">Click the map to stamp · Esc to stop</p>}
      </div>
      <div className="px-3 pb-3">
        {shown.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-[13px]">
            {MAP_ASSETS.length === 0
              ? "No assets yet. Add images to src/assets/map-assets/<category>/."
              : "Nothing matches."}
          </p>
        ) : (
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${tileSize}px, 1fr))` }}
          >
            {shown.map((asset) => (
              <MapAssetTile
                key={asset.id}
                asset={asset}
                armed={armed === asset.id}
                viewScale={viewScale}
                onArm={onArm}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
