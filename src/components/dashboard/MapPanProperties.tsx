import { Button } from "@/components/ui/button"

const PRESETS = [0.5, 1, 2]

type Props = {
  // The view's scale: 1 is 100%.
  zoom: number
  onZoom: (scale: number) => void
  onFit: () => void
}

// Pan has nothing to set: where the view is, and some zooms to jump to.
export function MapPanProperties({ zoom, onZoom, onFit }: Props) {
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
      <p className="text-muted-foreground text-xs">Drag the canvas to move around.</p>
    </>
  )
}
