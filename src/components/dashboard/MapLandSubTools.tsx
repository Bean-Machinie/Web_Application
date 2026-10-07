import { MinusSquare, PlusSquare } from "lucide-react"
import type { LandMode } from "@/lib/map-builder-tools"
import { MapSubToolButton } from "./MapSubToolButton"

type Props = {
  // Whether what is drawn now cuts, which Alt can flip from the mode picked.
  cutting: boolean
  onMode: (mode: LandMode) => void
}

export function MapLandSubTools({ cutting, onMode }: Props) {
  return (
    <>
      <MapSubToolButton
        label="Add land"
        hint="Draw an outline to add land. Overlapping shapes merge."
        active={!cutting}
        onClick={() => onMode("add")}
      >
        <PlusSquare />
      </MapSubToolButton>
      <MapSubToolButton
        label="Cut land"
        hint="Draw around land to cut it away: bays, lakes, straits."
        active={cutting}
        onClick={() => onMode("cut")}
      >
        <MinusSquare />
      </MapSubToolButton>
    </>
  )
}
