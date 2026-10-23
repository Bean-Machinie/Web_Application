import { useRef, useState } from "react"
import { sizeProblem } from "@/lib/map-canvas-size"
import { CANVAS_PRESETS, presetFor } from "@/lib/map-scene"
import type { CanvasPreset } from "@/lib/map-scene"

const FIRST = CANVAS_PRESETS["3:2"]

// The width and height being chosen for a new map, kept as text while they are typed.
// With the lock on, changing one keeps the ratio the other had when it went on (or when
// a preset or a swap last set it).
export function useMapSize() {
  const [width, setWidth] = useState(String(FIRST.width))
  const [height, setHeight] = useState(String(FIRST.height))
  const [locked, setLocked] = useState(false)
  const ratio = useRef(FIRST.width / FIRST.height)

  const w = Number(width)
  const h = Number(height)

  function set(nextWidth: number, nextHeight: number) {
    setWidth(String(nextWidth))
    setHeight(String(nextHeight))
    ratio.current = nextWidth / nextHeight
  }

  return {
    width,
    height,
    locked,
    w,
    h,
    problem: sizeProblem(w, h),
    preset: presetFor(w, h),
    pick: (preset: CanvasPreset) => set(CANVAS_PRESETS[preset].width, CANVAS_PRESETS[preset].height),
    editWidth(text: string) {
      setWidth(text)
      if (locked && Number(text) > 0) setHeight(String(Math.round(Number(text) / ratio.current)))
    },
    editHeight(text: string) {
      setHeight(text)
      if (locked && Number(text) > 0) setWidth(String(Math.round(Number(text) * ratio.current)))
    },
    setLocked(next: boolean) {
      setLocked(next)
      if (next && w > 0 && h > 0) ratio.current = w / h
    },
    swap() {
      setWidth(height)
      setHeight(width)
      ratio.current = 1 / ratio.current
    },
  }
}
