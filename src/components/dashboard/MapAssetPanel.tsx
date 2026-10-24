import { HoverIcon } from "@/components/icons/HoverIcon"
import { SearchIcon } from "@/components/icons/SearchIcon"
import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { MAP_ASSETS } from "@/lib/map-assets"
import { cn } from "@/lib/utils"
import { ALL_CATEGORIES, MapAssetCategorySelect } from "./MapAssetCategorySelect"
import { MapAssetTile } from "./MapAssetTile"

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
  const [category, setCategory] = useState(ALL_CATEGORIES)
  const [query, setQuery] = useState("")

  const shown = useMemo(() => {
    const text = query.trim().toLowerCase()
    return MAP_ASSETS.filter(
      (asset) =>
        (category === ALL_CATEGORIES || asset.category === category) &&
        (text === "" || asset.name.toLowerCase().includes(text))
    )
  }, [category, query])

  return (
    <section
      aria-label="Assets"
      className={cn("flex flex-col", disabled && "pointer-events-none opacity-60")}
    >
      <div className="bg-background sticky top-0 z-10 flex flex-col gap-2 p-3 pb-2">
        <div className="relative">
          <HoverIcon icon={SearchIcon} size={16} hoverParent className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            aria-label="Search assets"
            className="pl-8"
          />
        </div>
        <MapAssetCategorySelect value={category} onChange={setCategory} />
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
