import { markerShownFor } from "@/lib/quick-state"
import type { SheetActions } from "./character-actions"
import { SuggestedMarker } from "./SuggestedMarker"

// The marker for a field of the sheet, if what it holds was suggested.
export function markerFor(fieldId: string, actions: SheetActions) {
  const key = markerShownFor(fieldId, actions.values)
  return key ? <SuggestedMarker markerKey={key} actions={actions} /> : null
}
