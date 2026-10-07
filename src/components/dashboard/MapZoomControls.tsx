import { useEffect, useState } from "react"
import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"

type Props = {
  // The view's scale: 1 is 100%.
  zoom: number
  limits: { min: number; max: number }
  onZoomTo: (scale: number) => void
  onZoomBy: (factor: number) => void
  onFit: () => void
}

const STEP = 1.4
const RESOLUTION = 1000

// Zoom is felt in ratios, so the slider is too: each step along it is the same
// fraction in or out, from the furthest out to the closest.
const toPosition = (zoom: number, { min, max }: Props["limits"]) =>
  (Math.log(Math.min(Math.max(zoom, min), max) / min) / Math.log(max / min)) * RESOLUTION
const fromPosition = (position: number, { min, max }: Props["limits"]) =>
  min * Math.pow(max / min, position / RESOLUTION)

// How far the canvas is zoomed, with a slider, steps, a number to type over, and
// the two jumps. It is the same zoom as the status bar's.
export function MapZoomControls({ zoom, limits, onZoomTo, onZoomBy, onFit }: Props) {
  // While the slider is held it shows where it is, not the view, which catches up after.
  const [held, setHeld] = useState<number | null>(null)
  const shown = String(Math.round(zoom * 100))
  const [draft, setDraft] = useState(shown)
  useEffect(() => setDraft(shown), [shown])

  function finish() {
    const typed = Number(draft)
    if (draft.trim() === "" || !Number.isFinite(typed) || typed <= 0) return setDraft(shown)
    onZoomTo(typed / 100)
    setDraft(shown)
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-xs" aria-label="Zoom out" onClick={() => onZoomBy(1 / STEP)}>
          <Minus />
        </Button>
        <Slider
          aria-label="Zoom"
          min={0}
          max={RESOLUTION}
          step={1}
          value={[held ?? toPosition(zoom, limits)]}
          onValueChange={([position]) => {
            setHeld(position)
            onZoomTo(fromPosition(position, limits))
          }}
          onValueCommit={() => setHeld(null)}
        />
        <Button variant="ghost" size="icon-xs" aria-label="Zoom in" onClick={() => onZoomBy(STEP)}>
          <Plus />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative w-20">
          <Input
            inputMode="numeric"
            aria-label="Zoom percentage"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={finish}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur()
              if (event.key === "Escape") setDraft(shown)
            }}
            className="h-7 pr-6 text-right text-xs tabular-nums"
          />
          <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[11px]">
            %
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={onFit}>
          Fit
        </Button>
        <Button variant="outline" size="sm" onClick={() => onZoomTo(1)}>
          100%
        </Button>
      </div>
    </div>
  )
}
