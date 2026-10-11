import { LASSO_ICONS } from "./map-land-icons"
import { MapSubToolButton } from "./MapSubToolButton"

// The lasso has the one way of working, so its list is the one row: its icon shows
// whether it adds land or cuts it, and follows the mode, Alt's switch included.
export function MapLassoSubTools({ cutting }: { cutting: boolean }) {
  const Icon = LASSO_ICONS[cutting ? "cut" : "add"]
  return (
    <MapSubToolButton
      label="Lasso"
      hint="Draw an outline by hand. Overlapping shapes merge."
      active
      onClick={() => {}}
    >
      <Icon />
    </MapSubToolButton>
  )
}
