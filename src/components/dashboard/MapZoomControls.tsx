import { useState } from "react"
import { FlipVertical2, Minus, Percent, Plus } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { MapControlRow } from "./MapControlRow"
import { MapNumberField } from "./MapNumberField"
import { MapStepButton } from "./MapStepButton"

type Props = {
  // The view's scale: 1 is 100%.
  zoom: number
  limits: { min: number; max: number }
  onZoomTo: (scale: number) => void
  onZoomBy: (factor: number) => void
  onFlipH: () => void
}

const STEP = 1.4
const RESOLUTION = 1000

// Zoom is felt in ratios, so the slider is too: each step along it is the same
// fraction in or out, from the furthest out to the closest.
const toPosition = (zoom: number, { min, max }: Props["limits"]) =>
  (Math.log(Math.min(Math.max(zoom, min), max) / min) / Math.log(max / min)) * RESOLUTION
const fromPosition = (position: number, { min, max }: Props["limits"]) =>
  min * Math.pow(max / min, position / RESOLUTION)

// How far the canvas is zoomed, in one row: a slider, a number to type over, and the
// steps, the jump to 100% and the mirror. It is the same zoom as the status bar's.
export function MapZoomControls({ zoom, limits, onZoomTo, onZoomBy, onFlipH }: Props) {
  // While the slider is held it shows where it is, not the view, which catches up after.
  const [held, setHeld] = useState<number | null>(null)

  return (
    <MapControlRow
      slider={
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
          className="mr-2.5"
        />
      }
      field={
        <MapNumberField
          label="Zoom percentage"
          unit="%"
          value={Math.round(zoom * 100)}
          accepts={(value) => Number.isFinite(value) && value > 0}
          onCommit={(value) => onZoomTo(value / 100)}
        />
      }
      buttons={
        <>
          <MapStepButton label="Zoom out" action="view.zoomOut" onClick={() => onZoomBy(1 / STEP)}>
            <Minus />
          </MapStepButton>
          <MapStepButton label="Zoom in" action="view.zoomIn" onClick={() => onZoomBy(STEP)}>
            <Plus />
          </MapStepButton>
          <MapStepButton label="Zoom to 100%" action="view.zoom100" onClick={() => onZoomTo(1)}>
            <Percent />
          </MapStepButton>
        </>
      }
      aside={
        <MapStepButton label="Flip view horizontally" action="view.flip" onClick={onFlipH}>
          <FlipVertical2 />
        </MapStepButton>
      }
    />
  )
}
