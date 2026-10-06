import { useDeferredValue, useMemo } from "react"
import type { MultiPolygon } from "polygon-clipping"
import { smoothLand } from "@/lib/map-coast-smooth"

// The land as it is shown, with its corners rounded. Rounding a big coast takes
// a moment, so a slider stays smooth while the picture catches up.
export function useShownLand(
  land: MultiPolygon,
  roundness: number,
  { width, height }: { width: number; height: number }
) {
  const rounded = useDeferredValue(roundness)
  return useMemo(
    () => smoothLand(land, rounded, { width, height }),
    [land, rounded, width, height]
  )
}
