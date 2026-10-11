import { useCallback, useRef, useState } from "react"
import type { SavedStamp } from "@/lib/stamps/stamps"

// What the shape being placed can be told to do, set by the layer that holds it.
export type StampControls = { apply: () => void; cancel: () => void; flip: (axis: "x" | "y") => void }

// A landmass picked to be kept as a stamp, waiting for its name. "touchesEdge" is
// whether its outline runs along the map's edge, where it was cut straight.
export type PickedLandmass = Omit<SavedStamp, "id" | "name"> & { touchesEdge: boolean }

// The shape being placed with the Shapes sub tool, between its being drawn and being
// applied: whether there is one (for the keys and the buttons), what it can be told to
// do, and how big the last one was, for the next click. The shape itself, and its
// handles, live in the layer (see MapStampLayer). With it, in development, the picking
// of a landmass to be kept as a stamp: "saving" while the next click picks one.
export function useStampPlacement() {
  const [live, setLive] = useState(false)
  const [saving, setSaving] = useState(false)
  const [picked, setPicked] = useState<PickedLandmass | null>(null)
  const controls = useRef<StampControls | null>(null)
  const lastSize = useRef<{ width: number; height: number } | null>(null)

  const apply = useCallback(() => controls.current?.apply(), [])
  const cancel = useCallback(() => controls.current?.cancel(), [])
  const flip = useCallback((axis: "x" | "y") => controls.current?.flip(axis), [])

  return { live, setLive, saving, setSaving, picked, setPicked, controls, lastSize, apply, cancel, flip }
}

export type StampPlacement = ReturnType<typeof useStampPlacement>
