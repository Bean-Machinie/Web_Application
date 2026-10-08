import { useEffect, useRef } from "react"
import { useLocation, useSearchParams } from "react-router-dom"
import type * as L from "leaflet"
import type { MapSize } from "@/lib/map-geometry"
import { applyView, encodeView, parseView, recallView, rememberView } from "@/lib/map-view"

// How long the map must rest before its view goes into the URL.
const SETTLE_MS = 300

// Keeps the map's view in the URL as ?view=x,y,zoom, so a link, a reload and
// the browser's back and forward all land where the map was. It replaces the
// current history entry instead of adding one, and also remembers the view for
// the session, for opening the map again with no view in the URL. A map with
// neither starts fully zoomed out.
export function useMapView(map: L.Map | null, size: MapSize, mapId: string) {
  const [params, setParams] = useSearchParams()
  const { state } = useLocation()
  const urlView = params.get("view")
  // The last value this hook put in the URL, so it does not react to its own.
  const written = useRef<string | null>(null)
  const restored = useRef(false)
  const latest = useRef({ setParams, state })
  useEffect(() => {
    latest.current = { setParams, state }
  })

  // Opening: the URL's view, else the session's. After that, only a view that
  // someone else put in the URL, as back and forward do.
  useEffect(() => {
    if (!map) return
    if (urlView !== null && urlView === written.current) return
    const view = parseView(urlView) ?? (restored.current ? null : parseView(recallView(mapId)))
    restored.current = true
    if (view) applyView(map, size, view)
  }, [map, size, mapId, urlView])

  useEffect(() => {
    if (!map) return
    let pending = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const save = () => {
      pending = false
      const text = encodeView(map, size)
      written.current = text
      rememberView(mapId, text)
      latest.current.setParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          next.set("view", text)
          return next
        },
        // The state carries where this map was opened from, for the breadcrumbs.
        { replace: true, state: latest.current.state }
      )
    }
    const onMoveEnd = () => {
      pending = true
      clearTimeout(timer)
      timer = setTimeout(save, SETTLE_MS)
    }
    map.on("moveend", onMoveEnd)
    return () => {
      map.off("moveend", onMoveEnd)
      clearTimeout(timer)
      // Leaving mid-pan still keeps the view for the session, but must not
      // change the URL of a page that is going away.
      if (pending) rememberView(mapId, encodeView(map, size))
    }
  }, [map, size, mapId])
}
