import { useEffect, useRef, useState } from "react"
import { useAuth } from "@/auth/useAuth"
import { sideInvalid, sizeProblem } from "@/lib/map-canvas-size"
import { PRESETS, presetSize } from "@/lib/map-shapes"
import type { PresetKey } from "@/lib/map-shapes"

type Saved = { preset: PresetKey | "custom"; width: string; height: string; locked: boolean }

const FIRST: Saved = { preset: "3:2/standard", width: "3072", height: "2048", locked: false }

// What was chosen last time, if it is still a size a canvas may have.
function readSaved(key: string): Saved {
  try {
    const saved = JSON.parse(localStorage.getItem(key) ?? "null")
    const known = saved?.preset === "custom" || PRESETS.some((preset) => preset.key === saved?.preset)
    if (known && sizeProblem(Number(saved.width), Number(saved.height)) === null) {
      return { ...saved, locked: saved.locked === true }
    }
  } catch {
    // Unreadable, so start from the first.
  }
  return FIRST
}

// The width and height being chosen for a new map, kept as text while they are typed,
// and the preset they came from ("custom" once a number is typed). A preset fills them
// in the orientation they have now. With the lock on, changing one side keeps the ratio
// the other had when it went on (or when a swap or preset last set it). The choice is
// remembered per user in this browser, and is what the dialog opens on next time.
export function useMapSize() {
  const storageKey = `new-map-size:${useAuth().session!.user.id}`
  const [first] = useState(() => readSaved(storageKey))
  const [preset, setPreset] = useState(first.preset)
  const [width, setWidth] = useState(first.width)
  const [height, setHeight] = useState(first.height)
  const [locked, setLocked] = useState(first.locked)
  const ratio = useRef(Number(first.width) / Number(first.height))

  const w = Number(width)
  const h = Number(height)
  const problem = sizeProblem(w, h)

  useEffect(() => {
    if (problem) return
    try {
      localStorage.setItem(storageKey, JSON.stringify({ preset, width, height, locked }))
    } catch {
      // It just will not be remembered.
    }
  }, [storageKey, problem, preset, width, height, locked])
  // A side is marked when it is itself wrong; when each is fine but not together, both.
  const both = problem !== null && !sideInvalid(w) && !sideInvalid(h)

  return {
    preset,
    width,
    height,
    locked,
    w,
    h,
    problem,
    widthInvalid: sideInvalid(w) || both,
    heightInvalid: sideInvalid(h) || both,
    portrait: h > w,
    pick(key: PresetKey) {
      const size = presetSize(key, h > w)
      setPreset(key)
      setWidth(String(size.width))
      setHeight(String(size.height))
      ratio.current = size.width / size.height
    },
    editWidth(text: string) {
      setPreset("custom")
      setWidth(text)
      if (locked && Number(text) > 0) setHeight(String(Math.round(Number(text) / ratio.current)))
    },
    editHeight(text: string) {
      setPreset("custom")
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
