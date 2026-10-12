import { DETAIL_LOOK } from "@/lib/details/details"
import type { Detail } from "@/lib/details/details"

// A small outlined circle in the colour of the detail the brush paints, where the
// biome's ground is shown for the biomes.
export function MapDetailBadge({ detail }: { detail: Detail }) {
  const [r, g, b] = DETAIL_LOOK[detail].colour
  return (
    <span
      style={{ backgroundColor: `rgb(${r} ${g} ${b})` }}
      className="border-foreground/70 pointer-events-none absolute z-10 -right-1 -bottom-1 size-3.5 rounded-full border"
    />
  )
}
