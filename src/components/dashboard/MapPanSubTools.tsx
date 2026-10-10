import { Hand, RotateCw } from "lucide-react"
import type { PanMode } from "@/lib/map-builder-tools"
import { MapSubToolButton } from "./MapSubToolButton"

type Props = { mode: PanMode; onMode: (mode: PanMode) => void }

export function MapPanSubTools({ mode, onMode }: Props) {
  return (
    <>
      <MapSubToolButton
        label="Hand"
        hint="Drag the canvas to move around."
        active={mode === "hand"}
        onClick={() => onMode("hand")}
      >
        <Hand />
      </MapSubToolButton>
      <MapSubToolButton
        label="Rotate"
        hint="Drag around the middle of the view to turn the canvas."
        active={mode === "rotate"}
        onClick={() => onMode("rotate")}
      >
        <RotateCw />
      </MapSubToolButton>
    </>
  )
}
