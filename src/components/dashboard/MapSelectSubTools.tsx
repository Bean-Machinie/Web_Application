import { Lasso, SquareDashed } from "lucide-react"
import type { SelectMode } from "@/lib/map-builder-tools"
import { MapSubToolButton } from "./MapSubToolButton"

type Props = { mode: SelectMode; onMode: (mode: SelectMode) => void }

// How the select tool picks art on the empty canvas. Clicking art and dragging it
// work the same in both.
export function MapSelectSubTools({ mode, onMode }: Props) {
  return (
    <>
      <MapSubToolButton
        label="Rectangle"
        hint="Drag a box: everything it touches is selected."
        active={mode === "rectangle"}
        onClick={() => onMode("rectangle")}
      >
        <SquareDashed />
      </MapSubToolButton>
      <MapSubToolButton
        label="Lasso"
        hint="Draw an outline by hand: everything it touches is selected."
        active={mode === "lasso"}
        onClick={() => onMode("lasso")}
      >
        <Lasso />
      </MapSubToolButton>
    </>
  )
}
