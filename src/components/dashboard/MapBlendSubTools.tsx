import { Droplets } from "lucide-react"
import { MapSubToolButton } from "./MapSubToolButton"

// The blend brush has the one way of working, so its list is the one row: it is there
// so that the panel is laid out as for every other tool.
export function MapBlendSubTools() {
  return (
    <MapSubToolButton
      label="Blend"
      active
      onClick={() => {}}
    >
      <Droplets />
    </MapSubToolButton>
  )
}
