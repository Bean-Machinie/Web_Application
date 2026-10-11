import { useCallback, useRef, useState } from "react"
import { CORNER_ROUNDING } from "@/lib/stamps/stamp-corners"
import type { Rounding } from "@/lib/stamps/stamp-corners"
import type { SavedStamp } from "@/lib/stamps/stamps"

// What the shape being placed can be told to do, set by the layer that holds it.
export type StampControls = {
  apply: () => void
  cancel: () => void
  flip: (axis: "x" | "y") => void
  undo: () => void
  redo: () => void
}

// A landmass picked to be kept as a stamp, waiting for its name. "touchesEdge" is
// whether its outline runs along the map's edge, where it was cut straight.
export type PickedLandmass = Omit<SavedStamp, "id" | "name"> & { touchesEdge: boolean }

// The shape being placed with the Shapes sub tool, between its being drawn and being
// applied: whether there is one (for the keys and the buttons), what it can be told to
// do, and how big the last one was, for the next click. The shape itself, and its
// handles, live in the layer (see MapStampLayer), which also keeps its steps: undo and redo are
// the shape's own while it has some, and the map's after. With it, in development, the picking
// of a landmass to be kept as a stamp: "saving" while the next click picks one.
export function useStampPlacement() {
  const [live, setLive] = useState(false)
  const [saving, setSaving] = useState(false)
  // Whether the corners of the stamps that have them are rounded, and by how much: off to start, so they are sharp.
  const [rounding, setRounding] = useState<Rounding>({ on: false, amount: CORNER_ROUNDING.start })
  // Whether there is a step of the shape's own to go back or forward to.
  const [trail, setTrail] = useState({ canUndo: false, canRedo: false })
  const [picked, setPicked] = useState<PickedLandmass | null>(null)
  const controls = useRef<StampControls | null>(null)
  const lastSize = useRef<{ width: number; height: number } | null>(null)

  const apply = useCallback(() => controls.current?.apply(), [])
  const cancel = useCallback(() => controls.current?.cancel(), [])
  const flip = useCallback((axis: "x" | "y") => controls.current?.flip(axis), [])
  const undo = useCallback(() => controls.current?.undo(), [])
  const redo = useCallback(() => controls.current?.redo(), [])

  return { live, setLive, saving, setSaving, rounding, setRounding, picked, setPicked, controls, lastSize, apply, cancel, flip, ...trail, setTrail, undo, redo }
}

export type StampPlacement = ReturnType<typeof useStampPlacement>
