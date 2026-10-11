import { useDeferredValue, useMemo } from "react"
import type { MultiPolygon, Pair } from "polygon-clipping"
import { smoothLand } from "@/lib/map-coast-smooth"
import { pinSet } from "@/lib/map-pins"

// The land as it is shown, with its corners rounded, but for the pinned points. Rounding a big coast takes
// a moment, so a slider stays smooth while the picture catches up.
export function useShownLand(
  land: MultiPolygon,
  roundness: number,
  { width, height }: { width: number; height: number },
  pinned: Pair[]
) {
  const rounded = useDeferredValue(roundness)
  return useMemo(
    () => smoothLand(land, rounded, { width, height }, pinSet(pinned)),
    [land, rounded, width, height, pinned]
  )
}
