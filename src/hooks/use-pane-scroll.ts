import { useLayoutEffect, useRef, useState } from "react"
import { storage } from "@/lib/browser-storage"

const STORAGE_KEY = "journal-scroll"
// The most recent places kept; older ones are forgotten.
const KEEP = 100
const SAVE_DELAY_MS = 400
// How long to keep trying to reach a saved place while the content loads.
const RESTORE_MS = 4000

function readPositions() {
  try {
    const stored = JSON.parse(storage.getItem(STORAGE_KEY) ?? "{}") as Record<string, unknown>
    return Object.entries(stored).filter((entry): entry is [string, number] => typeof entry[1] === "number")
  } catch {
    return []
  }
}

// How far each thing was scrolled: leaving the journal for a full page, or closing
// the browser, and coming back finds each tab where it was left.
const positions = new Map<string, number>(readPositions())
let saving: number | undefined

function remember(key: string, top: number) {
  positions.delete(key)
  positions.set(key, top)
  window.clearTimeout(saving)
  saving = window.setTimeout(() => {
    const recent = [...positions].slice(-KEEP)
    storage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(recent)))
  }, SAVE_DELAY_MS)
}

// For the scrolling box of a pane. `key` names what it shows (null for nothing); a
// change of key saves where the old one was and goes to where the new one was left.
// What it shows may still be loading and too short to scroll that far, so the
// position is tried again every frame, until it is reached, the person scrolls
// themselves, or a few seconds pass.
export function usePaneScroll(key: string | null) {
  const box = useRef<HTMLDivElement>(null)
  const restoring = useRef(false)
  // Scrolled at all, so the strip above can show its edge.
  const [scrolled, setScrolled] = useState(false)

  useLayoutEffect(() => {
    const element = box.current
    if (!element || !key) return
    const target = positions.get(key) ?? 0
    restoring.current = target > 0
    element.scrollTop = target
    setScrolled(element.scrollTop > 0)
    if (!restoring.current) return

    // Each frame, since what is inside is swapped as it loads (a placeholder, then the
    // page, then its text), so there is no one element to watch grow.
    let frame = 0
    const started = performance.now()
    const stop = () => {
      restoring.current = false
      cancelAnimationFrame(frame)
    }
    const settle = () => {
      element.scrollTop = target
      if (Math.abs(element.scrollTop - target) < 1 || performance.now() - started > RESTORE_MS) stop()
      else frame = requestAnimationFrame(settle)
    }
    frame = requestAnimationFrame(settle)
    element.addEventListener("wheel", stop, { once: true })
    element.addEventListener("touchmove", stop, { once: true })
    return () => {
      stop()
      element.removeEventListener("wheel", stop)
      element.removeEventListener("touchmove", stop)
    }
  }, [key])

  // Not while it is being put back: a short page would overwrite the saved place.
  const onScroll = () => {
    if (box.current) setScrolled(box.current.scrollTop > 0)
    if (key && box.current && !restoring.current) remember(key, box.current.scrollTop)
  }

  return { box, onScroll, scrolled }
}
