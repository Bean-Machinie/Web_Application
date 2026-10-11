import { LassoIcon } from "./map-land-icons"
import { MapSubToolButton } from "./MapSubToolButton"

// The lasso has the one way of working, so its list is the one row: its icon shows
// whether it adds land or cuts it, and follows the mode, Alt's switch included.
export function MapLassoSubTools({ cutting }: { cutting: boolean }) {
  return (
    <MapSubToolButton
      label="Lasso"
      active
      onClick={() => {}}
    >
      <LassoIcon cutting={cutting} />
    </MapSubToolButton>
  )
}
