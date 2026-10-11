import { Lasso, Shapes } from "lucide-react"
import type { LandTool } from "@/lib/map-builder-tools"
import { MapSubToolButton } from "./MapSubToolButton"

type Props = {
  landTool: LandTool
  onLandTool: (tool: LandTool) => void
}

export function MapLandSubTools({ landTool, onLandTool }: Props) {
  return (
    <>
      <MapSubToolButton
        label="Lasso"
        hint="Draw an outline by hand. Overlapping shapes merge."
        active={landTool === "lasso"}
        onClick={() => onLandTool("lasso")}
      >
        <Lasso />
      </MapSubToolButton>
      <MapSubToolButton
        label="Shapes"
        hint="Stamp a shape from the library, then move, stretch and turn it before applying."
        active={landTool === "shapes"}
        onClick={() => onLandTool("shapes")}
      >
        <Shapes />
      </MapSubToolButton>
    </>
  )
}
