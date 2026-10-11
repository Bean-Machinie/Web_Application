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
        active={mode === "rectangle"}
        onClick={() => onMode("rectangle")}
      >
        <SquareDashed />
      </MapSubToolButton>
      <MapSubToolButton
        label="Lasso"
        active={mode === "lasso"}
        onClick={() => onMode("lasso")}
      >
        <Lasso />
      </MapSubToolButton>
    </>
  )
}
