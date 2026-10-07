import { Compass, FlipHorizontal2, RotateCcw, RotateCw } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { useHeldModifiers } from "@/hooks/use-held-modifiers"
import { snapAngle } from "@/lib/snap-angle"
import { MapControlRow } from "./MapControlRow"
import { MapNumberField } from "./MapNumberField"
import { MapStepButton } from "./MapStepButton"

type Props = {
  // Degrees, clockwise, as seen.
  rotation: number
  onRotateTo: (degrees: number) => void
  onRotateLeft: () => void
  onRotateRight: () => void
  onReset: () => void
  onFlipV: () => void
}

// The slider's own scale starts at nothing, so that the middle of it is 0 degrees,
// as for the zoom's.
const HALF_TURN = 180

// How far the view is turned, in a row like the zoom's: a slider (held at right
// angles, or at every 15 degrees with Shift), a number, and the turns and the mirror.
// All of it is of the view; the map is never changed.
export function MapRotateControls({ rotation, onRotateTo, onRotateLeft, onRotateRight, onReset, onFlipV }: Props) {
  const { shift } = useHeldModifiers()

  return (
    <MapControlRow
      slider={
        <Slider
          aria-label="Rotation"
          min={0}
          max={HALF_TURN * 2}
          step={1}
          value={[Math.round(rotation) + HALF_TURN]}
          onValueChange={([position]) => onRotateTo(snapAngle(position - HALF_TURN, shift))}
          className="mr-2.5"
        />
      }
      field={<MapNumberField label="Rotation angle" unit="°" value={Math.round(rotation)} onCommit={onRotateTo} />}
      buttons={
        <>
          <MapStepButton label="Rotate left" action="view.rotateLeft" onClick={onRotateLeft}>
            <RotateCcw />
          </MapStepButton>
          <MapStepButton label="Rotate right" action="view.rotateRight" onClick={onRotateRight}>
            <RotateCw />
          </MapStepButton>
          <MapStepButton label="Reset rotation and flip" action="view.resetRotation" onClick={onReset}>
            <Compass />
          </MapStepButton>
        </>
      }
      aside={
        <MapStepButton label="Flip view vertically" onClick={onFlipV}>
          <FlipHorizontal2 />
        </MapStepButton>
      }
    />
  )
}
