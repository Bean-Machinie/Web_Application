import { Button } from "@/components/ui/button"
import type { PanMode } from "@/lib/map-builder-tools"

const PRESETS = [0.5, 1, 2]

type Props = {
  mode: PanMode
  // The view's scale: 1 is 100%.
  zoom: number
  onZoom: (scale: number) => void
  onFit: () => void
}

// Pan has nothing to set: where the view is, and some zooms to jump to.
export function MapPanProperties({ mode, zoom, onZoom, onFit }: Props) {
  return (
    <>
      <p className="text-xs">
        <span className="text-muted-foreground">Zoom </span>
        <span className="tabular-nums">{Math.round(zoom * 100)}%</span>
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        <Button variant="outline" size="sm" onClick={onFit}>
          Fit
        </Button>
        {PRESETS.map((scale) => (
          <Button key={scale} variant="outline" size="sm" onClick={() => onZoom(scale)}>
            {scale * 100}%
          </Button>
        ))}
      </div>
      <p className="text-muted-foreground text-xs">
        {mode === "rotate"
          ? "Drag around the middle of the view to turn the canvas. Hold Shift to turn in steps of 15°."
          : "Drag the canvas to move around."}
      </p>
    </>
  )
}
