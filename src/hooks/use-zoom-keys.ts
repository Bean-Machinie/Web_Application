import { useEffect, useRef } from "react"

type Zoom = {
  zoomBy: (factor: number) => void
  zoomTo: (scale: number) => void
  fit: () => void
}

const STEP = 1.4

// Ctrl and plus or minus zoom in and out, Ctrl+0 fits the canvas and Ctrl+Alt+0
// goes to 100%. They are the browser's own zoom keys, so the page's is held back.
// Keys are read by position, since a plus is a shifted key on many keyboards.
export function useZoomKeys(zoom: Zoom, enabled: boolean) {
  const latest = useRef(zoom)
  useEffect(() => {
    latest.current = zoom
  })

  useEffect(() => {
    if (!enabled) return
    const onKey = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return
      const now = latest.current
      const zero = event.code === "Digit0" || event.code === "Numpad0"
      if (event.code === "Equal" || event.code === "NumpadAdd") now.zoomBy(STEP)
      else if (event.code === "Minus" || event.code === "NumpadSubtract") now.zoomBy(1 / STEP)
      else if (zero && event.altKey) now.zoomTo(1)
      else if (zero) now.fit()
      else return
      event.preventDefault()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [enabled])
}
