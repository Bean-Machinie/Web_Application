import type { RefObject } from "react"
import type Konva from "konva"
import { Transformer } from "react-konva"

const ANCHORS = [
  "top-left",
  "top-center",
  "top-right",
  "middle-left",
  "middle-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
]
const SNAPS = Array.from({ length: 24 }, (_, index) => index * 15)
const BLUE = "#2f6fed"
// The least a side of the shape can be pulled down to, in canvas pixels.
export const LEAST = 4

type Props = {
  transformer: RefObject<Konva.Transformer | null>
  // Shift is held: rotating snaps to 15 degrees.
  snapRotation: boolean
  // A stretch, scale or turn is done.
  onEdited: () => void
}

// The handles of the shape being placed: the sides stretch it, the corners scale it
// with its proportions kept, and the one above turns it.
export function MapStampHandles({ transformer, snapRotation, onEdited }: Props) {
  return (
    <Transformer
      ref={transformer}
      keepRatio
      // Shift only snaps the turn here: the corners keep the proportions, the sides stretch.
      shiftBehavior="none"
      enabledAnchors={ANCHORS}
      rotationSnaps={snapRotation ? SNAPS : []}
      rotationSnapTolerance={7.5}
      flipEnabled
      ignoreStroke
      borderStroke={BLUE}
      borderStrokeWidth={1.5}
      anchorStroke={BLUE}
      anchorFill="#ffffff"
      anchorSize={10}
      anchorCornerRadius={2}
      rotateAnchorOffset={26}
      onTransformEnd={onEdited}
      boundBoxFunc={(before, after) => (Math.abs(after.width) < LEAST || Math.abs(after.height) < LEAST ? before : after)}
    />
  )
}
