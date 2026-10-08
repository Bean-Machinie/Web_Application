import { useCallback, useEffect, useRef, useState } from "react"
import type * as L from "leaflet"
import type { MapMarker } from "@/lib/world-map-markers"

// A pointer passing over a marker should not open it.
const OPEN_DELAY = 120
// Time for the pointer to travel from the pin onto its card without closing it.
const CLOSE_DELAY = 80

type Options = {
  map: L.Map | null
  markers: MapMarker[]
  selectedId: string | null
  setSelectedId: (id: null) => void
}

// Which marker's card is on screen. Hover opens it after a short delay and a
// click keeps it open. When it closes the card stays mounted until it has
// folded back into its pin, so `marker` can outlive `open`.
export function useMapMarkerCard({ map, markers, selectedId, setSelectedId }: Options) {
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [lastId, setLastId] = useState<string | null>(null)
  const hovered = useRef<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const settle = useCallback((id: string | null, delay: number) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      hovered.current = id
      setHoverId(id)
    }, delay)
  }, [])

  const enter = useCallback(
    (id: string) => {
      // Touch has no hover; a tap selects instead.
      if (!window.matchMedia("(hover: hover)").matches) return
      if (hovered.current === id) clearTimeout(timer.current)
      else settle(id, OPEN_DELAY)
    },
    [settle]
  )
  const leave = useCallback(() => settle(null, CLOSE_DELAY), [settle])
  // The pin vanishes under its own card, which reads as the pointer leaving
  // it. Once the card is open it alone decides when hover ends.
  const leavePin = useCallback(() => {
    if (hovered.current === null) leave()
  }, [leave])

  // Folds the card back into its pin.
  const collapse = useCallback(() => {
    clearTimeout(timer.current)
    hovered.current = null
    setHoverId(null)
    setSelectedId(null)
  }, [setSelectedId])

  // Removes the card at once, for when its pin is about to move.
  const dismiss = useCallback(() => {
    collapse()
    setLastId(null)
  }, [collapse])

  const done = useCallback(() => setLastId(null), [])

  const shownId = hoverId ?? selectedId
  // Remembered so the card can fold back after it stops being shown.
  if (shownId && shownId !== lastId) setLastId(shownId)

  useEffect(() => () => clearTimeout(timer.current), [])

  // The card would drift from its pin, so a pan folds it back and a zoom
  // removes it, since the pins glide to new places during one.
  useEffect(() => {
    if (!map) return
    map.on("movestart", collapse)
    map.on("zoomstart", dismiss)
    return () => {
      map.off("movestart", collapse)
      map.off("zoomstart", dismiss)
    }
  }, [map, collapse, dismiss])

  const marker = markers.find((entry) => entry.id === (shownId ?? lastId)) ?? null
  return { marker, open: shownId !== null, enter, leave, leavePin, dismiss, done }
}
