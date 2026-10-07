import { useMemo, useState } from "react"
import { Image as ImageIcon, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { TILE_SIZE, useAssetTileSize } from "@/hooks/use-asset-tile-size"
import { ASSET_CATEGORIES, MAP_ASSETS, categoryLabel } from "@/lib/map-assets"
import { cn } from "@/lib/utils"
import { MapAssetTile } from "./MapAssetTile"

const ALL = "all"

type Props = {
  armed: string | null
  onArm: (id: string) => void
  viewScale: number
  disabled: boolean
}

// The library, beside the canvas: a search, a list of the categories, a slider
// for the size of the tiles, and the art as tiles. The categories are the folders
// of src/assets/map-assets.
export function MapAssetPanel({ armed, onArm, viewScale, disabled }: Props) {
  const [category, setCategory] = useState(ALL)
  const [query, setQuery] = useState("")
  const [tileSize, setTileSize] = useAssetTileSize()

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
      <div className="bg-background sticky top-0 z-10 flex flex-col gap-2 p-4 pb-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-medium">Assets</h2>
          <span className="text-muted-foreground truncate text-xs">
            {armed ? "Click the map to stamp · Esc to stop" : "Click to pick, or drag onto the map"}
          </span>
        </div>
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
        <div className="flex items-center gap-3">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger size="sm" aria-label="Category" className="min-w-0 flex-1">
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
          <ImageIcon className="text-muted-foreground size-3.5 shrink-0" aria-hidden />
          <Slider
            aria-label="Thumbnail size"
            className="w-20 shrink-0"
            min={TILE_SIZE.min}
            max={TILE_SIZE.max}
            step={4}
            value={[tileSize]}
            onValueChange={([size]) => setTileSize(size)}
          />
        </div>
      </div>
      <div className="px-4 pb-4">
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
